import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

// ── Rate limiter: 40 req / IP / hour ─────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 40;
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

/**
 * GET /api/tts?text=...&voice=nova
 * Returns audio/mpeg from OpenAI TTS.
 * Cached 24 h by the client so repeated plays are free.
 */
router.get("/tts", async (req, res) => {
  const ip = getIp(req);
  if (!checkRate(ip)) {
    res.status(429).json({ error: "Too many requests. Try again later." });
    return;
  }

  const text  = typeof req.query.text  === "string" ? req.query.text.slice(0, 2000)  : "";
  const voice = typeof req.query.voice === "string" ? req.query.voice : "nova";

  if (!text) {
    res.status(400).json({ error: "Missing required query param: text" });
    return;
  }

  // Only allow safe voice values
  const VALID_VOICES = ["alloy","echo","fable","onyx","nova","shimmer"];
  const safeVoice = VALID_VOICES.includes(voice) ? voice as "nova" : "nova";

  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: safeVoice,
      input: text,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Length", buffer.length);
    res.send(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("TTS error:", msg);
    res.status(500).json({ error: "TTS generation failed" });
  }
});

export default router;
