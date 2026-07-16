import { Router, type Request } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

// ── Simple in-memory rate limiter: max 30 req / IP / hour ─────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT  = 30;
const WINDOW_MS   = 60 * 60 * 1000; // 1 hour

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

// Clean up old entries every hour to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateMap.entries()) {
    if (now > entry.resetAt) rateMap.delete(ip);
  }
}, WINDOW_MS);

/**
 * GET /api/devotional
 * Query params: book, chapter, verse, en, pt
 *
 * Returns a short devotional reflection in Brazilian Portuguese for the given
 * Bible verse. Cached client-side (AsyncStorage) — one generation per day.
 */
router.get("/devotional", async (req, res) => {
  const q = req.query as Record<string, unknown>;
  const book    = typeof q.book    === "string" ? q.book.slice(0, 60)    : "";
  const chapter = typeof q.chapter === "string" ? q.chapter.slice(0, 4)  : "";
  const verse   = typeof q.verse   === "string" ? q.verse.slice(0, 4)    : "";
  const en      = typeof q.en      === "string" ? q.en.slice(0, 500)     : "";
  const pt      = typeof q.pt      === "string" ? q.pt.slice(0, 500)     : "";
  const lang    = typeof q.lang    === "string" && q.lang === "en" ? "en" : "pt";

  // Error messages follow the reader's chosen language, matching the UI.
  const msg = (en_: string, pt_: string) => (lang === "en" ? en_ : pt_);

  // Rate limiting
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({
      error: msg("Too many requests. Please try again later.",
                 "Muitas requisições. Tente novamente mais tarde."),
    });
    return;
  }

  if (!en || !pt) {
    res.status(400).json({ error: "Missing required query params: en, pt" });
    return;
  }

  const reference = [book, chapter, verse].filter(Boolean).join(" ");

  const systemPrompt = lang === "en"
    ? "You are a warm, encouraging evangelical pastor. Write short, practical morning devotionals in clear, accessible American English. Be direct, avoid religious jargon, and keep it under 120 words. Output plain prose only — no markdown formatting (no asterisks, underscores, headings, or bullet lists) and no restating the Bible verse itself, since it is already shown separately."
    : "Você é um pastor evangélico gentil e encorajador. Escreva reflexões devocionais curtas, calorosas e práticas em português brasileiro. Seja direto, use linguagem acessível, evite jargão religioso excessivo. Nunca ultrapasse 120 palavras. Escreva apenas em prosa simples — sem formatação markdown (sem asteriscos, sublinhados, títulos ou listas) e sem repetir o versículo bíblico, pois ele já é exibido separadamente.";

  const userPrompt = lang === "en"
    ? `Write a morning devotional reflection for ${reference}:\n\n"${en}"\n\nThe reflection should: (1) highlight the central truth of the verse, (2) offer a practical application for today, (3) close with a brief prayer or encouragement. Max 120 words.`
    : `Escreva uma reflexão devocional de uma manhã para o versículo ${reference}:\n\n"${en}"\n\n"${pt}"\n\nA reflexão deve: (1) destacar a verdade central do versículo, (2) trazer uma aplicação prática para o dia de hoje, (3) terminar com uma breve oração ou encorajamento. Máximo 120 palavras.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt   },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      res.status(502).json({
        error: msg("Devotional not generated. Please try again.",
                   "Devocional não gerado. Tente novamente."),
      });
      return;
    }
    res.json({ text });
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Devotional generation error:", detail);
    res.status(500).json({
      error: msg("Failed to generate devotional. Please try again.",
                 "Falha ao gerar devocional. Tente novamente."),
    });
  }
});

export default router;
