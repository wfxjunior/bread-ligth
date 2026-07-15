import { Router } from "express";
import OpenAI from "openai";
import { ReplitConnectors } from "@replit/connectors-sdk";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

const connectors = new ReplitConnectors();

type TtsProvider = "openai" | "elevenlabs";
const OPENAI_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"] as const;

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

function cacheKey(provider: TtsProvider, voice: string, text: string): string {
  return `${provider}::${voice}::${text}`;
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

// ── ElevenLabs voice list — fetched live, not hardcoded ─────────────────────
// Which voices exist (premade + any cloned ones) is specific to the
// connected ElevenLabs account, so we ask its API rather than guessing IDs
// that might not exist for this account. Cached briefly since the list
// rarely changes and every Settings screen open would otherwise re-fetch it.
interface ElevenVoiceSummary { id: string; name: string; previewUrl: string | null }
let elevenVoicesCache: { at: number; voices: ElevenVoiceSummary[] } | null = null;
const ELEVEN_VOICES_TTL_MS = 60 * 60 * 1000;

/**
 * GET /api/tts/voices?provider=openai|elevenlabs
 * Lists the voices selectable for the given provider. OpenAI's set is fixed;
 * ElevenLabs' is fetched live from the connected account and cached for 1h.
 */
router.get("/tts/voices", async (req, res) => {
  const provider: TtsProvider = req.query.provider === "elevenlabs" ? "elevenlabs" : "openai";

  if (provider === "openai") {
    res.json({ voices: OPENAI_VOICES.map(id => ({ id, name: id, previewUrl: null })) });
    return;
  }

  try {
    if (elevenVoicesCache && Date.now() - elevenVoicesCache.at < ELEVEN_VOICES_TTL_MS) {
      res.json({ voices: elevenVoicesCache.voices });
      return;
    }
    const response = await connectors.proxy("elevenlabs", "/v1/voices", { method: "GET" });
    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      throw new Error(`ElevenLabs voices fetch failed: ${response.status} ${errBody.slice(0, 500)}`);
    }
    const data = (await response.json()) as {
      voices?: Array<{ voice_id: string; name: string; preview_url?: string | null }>;
    };
    const voices: ElevenVoiceSummary[] = (data.voices ?? []).map(v => ({
      id: v.voice_id,
      name: v.name,
      previewUrl: v.preview_url ?? null,
    }));
    elevenVoicesCache = { at: Date.now(), voices };
    res.json({ voices });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("ElevenLabs voices error:", msg);
    res.status(500).json({ error: "Failed to fetch ElevenLabs voices" });
  }
});

/**
 * GET /api/tts?text=...&voice=nova&provider=openai|elevenlabs
 * Returns audio/mpeg from the requested TTS provider.
 * Cached 24 h by the client so repeated plays are free.
 */
router.get("/tts", async (req, res) => {
  const text     = typeof req.query.text  === "string" ? req.query.text.slice(0, 2000) : "";
  const voice    = typeof req.query.voice === "string" ? req.query.voice : "nova";
  const provider: TtsProvider = req.query.provider === "elevenlabs" ? "elevenlabs" : "openai";

  if (!text) {
    res.status(400).json({ error: "Missing required query param: text" });
    return;
  }

  let safeVoice: string;
  if (provider === "openai") {
    safeVoice = (OPENAI_VOICES as readonly string[]).includes(voice) ? voice : "nova";
  } else {
    // ElevenLabs voice IDs are opaque alphanumeric strings handed back by
    // their own API (see /tts/voices above) — just bound charset/length
    // before it's interpolated into the proxied URL path.
    safeVoice = /^[A-Za-z0-9]{1,64}$/.test(voice) ? voice : "";
    if (!safeVoice) {
      res.status(400).json({ error: "Invalid ElevenLabs voice id" });
      return;
    }
  }

  // Cache hits are free — they don't touch the provider, so they don't count against the rate limit.
  const key = cacheKey(provider, safeVoice, text);
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
    let buffer: Buffer;

    if (provider === "elevenlabs") {
      const response = await connectors.proxy("elevenlabs", `/v1/text-to-speech/${safeVoice}`, {
        method: "POST",
        headers: { Accept: "audio/mpeg" },
        body: {
          text,
          // Multilingual model — the app reads verses in both English and
          // Portuguese, so a single-language model would mispronounce one of them.
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        },
      });
      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(`ElevenLabs TTS failed: ${response.status} ${errBody.slice(0, 200)}`);
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } else {
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
      buffer = Buffer.from(audioData, "base64");
    }

    if (!buffer.length) throw new Error("No audio data returned from provider");
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
