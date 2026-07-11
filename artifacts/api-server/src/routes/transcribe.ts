import { Router, raw } from "express";
import OpenAI, { toFile } from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

// ── Rate limiter: 30 req / IP / hour — pronunciation practice is occasional, not continuous ──
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS  = 60 * 60 * 1000;

function getIp(req: import("express").Request): string {
  const fwd = req.headers["x-forwarded-for"];
  return (typeof fwd === "string" ? fwd.split(",")[0] : req.socket.remoteAddress) ?? "unknown";
}
function checkRate(ip: string): boolean {
  const now = Date.now();
  const e = rateMap.get(ip);
  if (!e || now > e.resetAt) { rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS }); return true; }
  if (e.count >= RATE_LIMIT) return false;
  e.count++;
  return true;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, e] of rateMap) if (now > e.resetAt) rateMap.delete(ip);
}, WINDOW_MS);

const MAX_BYTES = 10 * 1024 * 1024; // 10MB — a few seconds of a spoken verse

/**
 * POST /api/transcribe
 * Body: raw audio bytes (m4a/wav/webm — whatever expo-av records).
 * Returns { text } — used client-side for gentle pronunciation-practice feedback.
 * Uses its own raw-body parser since the app-wide body parser only handles JSON/urlencoded.
 */
router.post("/transcribe", raw({ type: () => true, limit: "10mb" }), async (req, res) => {
  if (!process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] || !process.env["AI_INTEGRATIONS_OPENAI_API_KEY"]) {
    res.status(503).json({ unsupported: true, error: "Transcription service not configured." });
    return;
  }

  const ip = getIp(req);
  if (!checkRate(ip)) {
    res.status(429).json({ error: "Too many requests. Try again later." });
    return;
  }

  const body = req.body as Buffer;
  if (!Buffer.isBuffer(body) || body.length === 0) {
    res.status(400).json({ error: "Missing audio body." });
    return;
  }
  if (body.length > MAX_BYTES) {
    res.status(413).json({ error: "Audio too large." });
    return;
  }

  const contentType = req.headers["content-type"] ?? "audio/m4a";
  const ext = contentType.includes("wav") ? "wav" : contentType.includes("webm") ? "webm" : "m4a";

  try {
    const file = await toFile(body, `recording.${ext}`, { type: contentType });
    const result = await openai.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file,
      response_format: "json",
    });
    res.json({ text: result.text ?? "" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Transcription error:", msg);
    res.status(500).json({ error: "Transcription failed. Please try again." });
  }
});

export default router;
