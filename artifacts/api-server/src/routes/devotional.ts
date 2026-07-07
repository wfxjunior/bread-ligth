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
  // Rate limiting
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Muitas requisições. Tente novamente mais tarde." });
    return;
  }

  const q = req.query as Record<string, unknown>;
  const book    = typeof q.book    === "string" ? q.book.slice(0, 60)    : "";
  const chapter = typeof q.chapter === "string" ? q.chapter.slice(0, 4)  : "";
  const verse   = typeof q.verse   === "string" ? q.verse.slice(0, 4)    : "";
  const en      = typeof q.en      === "string" ? q.en.slice(0, 500)     : "";
  const pt      = typeof q.pt      === "string" ? q.pt.slice(0, 500)     : "";

  if (!en || !pt) {
    res.status(400).json({ error: "Missing required query params: en, pt" });
    return;
  }

  const reference = [book, chapter, verse].filter(Boolean).join(" ");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 2000,
      messages: [
        {
          role: "system",
          content:
            "Você é um pastor evangélico gentil e encorajador. Escreva reflexões devocionais curtas, calorosas e práticas em português brasileiro. Seja direto, use linguagem acessível, evite jargão religioso excessivo. Nunca ultrapasse 120 palavras.",
        },
        {
          role: "user",
          content: `Escreva uma reflexão devocional de uma manhã para o versículo ${reference}:\n\n"${en}"\n\n"${pt}"\n\nA reflexão deve: (1) destacar a verdade central do versículo, (2) trazer uma aplicação prática para o dia de hoje, (3) terminar com uma breve oração ou encorajamento. Máximo 120 palavras.`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      res.status(502).json({ error: "Devocional não gerado. Tente novamente." });
      return;
    }
    res.json({ text });
  } catch (err: any) {
    console.error("Devotional generation error:", err?.message);
    res.status(500).json({ error: "Falha ao gerar devocional. Tente novamente." });
  }
});

export default router;
