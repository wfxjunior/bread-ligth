import { Router, type Request } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

// ── Rate limiter: 120 req / IP / hour ────────────────────────────────────────
// Tapping unknown words while reading is frequent, but each unique word is
// cached below (and on-device by the client), so real model calls stay bounded.
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 120;
const WINDOW_MS  = 60 * 60 * 1000;

function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap.entries()) {
    if (now > entry.resetAt) rateMap.delete(ip);
  }
}, WINDOW_MS);

// ── In-memory cache — a given word resolves to the same entry for everyone ────
interface WordResult { pt: string; pronunciation: string; example: string }
const CACHE_MAX = 2000;
const cache = new Map<string, WordResult>();
function cacheGet(k: string): WordResult | undefined {
  const hit = cache.get(k);
  if (hit) { cache.delete(k); cache.set(k, hit); }
  return hit;
}
function cacheSet(k: string, v: WordResult): void {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(k, v);
}

/**
 * GET /api/word
 * Query params: en (the English word), context (optional sentence it appeared
 * in, improves sense disambiguation), lang ('pt' | 'en', default 'pt').
 *
 * Returns { pt, pronunciation, example } so any word the static dictionary is
 * missing still gets a translation — the fallback that makes the in-reading
 * word lookup cover 100% of the Bible's vocabulary.
 */
router.get("/word", async (req, res) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Too many requests. Try again later." });
    return;
  }

  const q = req.query as Record<string, unknown>;
  const en      = typeof q.en      === "string" ? q.en.trim().slice(0, 60)   : "";
  const context = typeof q.context === "string" ? q.context.slice(0, 300)    : "";
  const lang    = typeof q.lang    === "string" && q.lang === "en" ? "en" : "pt";

  if (!en) {
    res.status(400).json({ error: "Missing required query param: en" });
    return;
  }

  // Only translate a single word/short phrase — reject anything that looks like
  // free-form input so this can't be used as a general-purpose LLM endpoint.
  if (!/^[A-Za-z][A-Za-z'’-]*( [A-Za-z'’-]+){0,2}$/.test(en)) {
    res.status(400).json({ error: "Invalid word." });
    return;
  }

  const key = `${lang}::${en.toLowerCase()}`;
  const cached = cacheGet(key);
  if (cached) {
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.json(cached);
    return;
  }

  const glossLang = lang === "en" ? "English" : "Brazilian Portuguese";
  const systemPrompt =
    `You define single English words for a learner reading the Bible. ` +
    `Respond with ONLY a compact JSON object, no markdown, exactly: ` +
    `{"pt":"<short ${glossLang} gloss, a few words>","pronunciation":"<IPA without slashes>","example":"<one short, simple English example sentence>"}. ` +
    `Use the given context only to pick the right sense; never mention it.`;
  const userPrompt = context
    ? `Word: "${en}"\nContext: "${context}"`
    : `Word: "${en}"`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4-mini",
      max_completion_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    let parsed: Partial<WordResult> = {};
    try { parsed = JSON.parse(raw) as Partial<WordResult>; } catch { parsed = {}; }

    const result: WordResult = {
      pt: typeof parsed.pt === "string" ? parsed.pt.slice(0, 120) : "",
      pronunciation: typeof parsed.pronunciation === "string"
        ? parsed.pronunciation.replace(/[/[\]]/g, "").slice(0, 60) : "",
      example: typeof parsed.example === "string" ? parsed.example.slice(0, 160) : "",
    };

    if (!result.pt) {
      res.status(502).json({ error: "Could not define this word. Try again." });
      return;
    }

    cacheSet(key, result);
    res.setHeader("Cache-Control", "public, max-age=604800");
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Word definition error:", msg);
    res.status(500).json({ error: "Failed to define word. Try again." });
  }
});

export default router;
