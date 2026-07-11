import { Router } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

// ── Rate limiter: 300 req / IP / hour ────────────────────────────────────────
// Raised from 40/hr — continuous chapter playback needs ~1 request per verse.
// Cache hits (below) never count against this limit; only real OpenAI
// generations do, so cost stays proportional to unique text, not traffic.
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 300;
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

// ── In-memory audio cache — keyed by voice+text, capped LRU-style ───────────
// Repeated verse playback (continuous chapter reading, replays) is common;
// caching avoids re-hitting OpenAI for the same text and doesn't count
// against the rate limit above.
const AUDIO_CACHE_MAX = 200;
const audioCache = new Map<string, Buffer>();

function cacheKey(voice: string, text: string): string {
  return `${voice}::${text}`;
}
function cacheGet(key: string): Buffer | undefined {
  const hit = audioCache.get(key);
  if (hit) {
    // refresh LRU order
    audioCache.delete(key);
    audioCache.set(key, hit);
  }
  return hit;
}
function cacheSet(key: string, buf: Buffer): void {
  if (audioCache.size >= AUDIO_CACHE_MAX) {
    const oldest = audioCache.keys().next().value;
    if (oldest !== undefined) audioCache.delete(oldest);
  }
  audioCache.set(key, buf);
}

/**
 * GET /api/tts?text=...&voice=nova
 * Returns audio/mpeg from OpenAI TTS.
 * Cached 24 h by the client so repeated plays are free.
 */
router.get("/tts", async (req, res) => {
  const text  = typeof req.query.text  === "string" ? req.query.text.slice(0, 2000)  : "";
  const voice = typeof req.query.voice === "string" ? req.query.voice : "nova";

  if (!text) {
    res.status(400).json({ error: "Missing required query param: text" });
    return;
  }

  // Only allow safe voice values
  const VALID_VOICES = ["alloy","echo","fable","onyx","nova","shimmer"];
  const safeVoice = VALID_VOICES.includes(voice) ? voice as "nova" : "nova";

  // Cache hits are free — they don't touch OpenAI, so they don't count against the rate limit.
  const key = cacheKey(safeVoice, text);
  const cached = cacheGet(key);
  if (cached) {
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Length", cached.length);
    res.setHeader("X-Cache", "HIT");
    res.send(cached);
    return;
  }

  const ip = getIp(req);
  if (!checkRate(ip)) {
    res.status(429).json({ error: "Too many requests. Try again later." });
    return;
  }

  try {
    // The Replit AI Integrations OpenAI proxy does not support the raw
    // POST /audio/speech endpoint (openai.audio.speech.create) — it 400s
    // with "Endpoint not supported". TTS must instead go through chat
    // completions with audio output modality (gpt-audio).
    const response = (await openai.chat.completions.create({
      model: "gpt-audio",
      modalities: ["text", "audio"],
      audio: { voice: safeVoice, format: "mp3" },
      messages: [
        { role: "system", content: "You are an assistant that performs text-to-speech. Read the given text aloud in a warm, clear, natural voice, verbatim, with no extra commentary." },
        { role: "user", content: text },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as unknown as { choices: Array<{ message?: { audio?: { data?: string } } }> };

    const audioData = response.choices[0]?.message?.audio?.data ?? "";
    const buffer = Buffer.from(audioData, "base64");
    if (!buffer.length) throw new Error("No audio data returned from OpenAI");
    cacheSet(key, buffer);
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("X-Cache", "MISS");
    res.send(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("TTS error:", msg);
    res.status(500).json({ error: "TTS generation failed" });
  }
});

export default router;
