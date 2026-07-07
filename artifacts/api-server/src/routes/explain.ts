import { Router, type Request } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
  apiKey:  process.env["AI_INTEGRATIONS_OPENAI_API_KEY"],
});

// ── Rate limiter: max 20 req / IP / hour ──────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
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

/**
 * GET /api/explain
 * Query params: book, chapter, verse, en
 *
 * Returns a short, plain-language explanation in Brazilian Portuguese
 * for the given Bible verse.
 */
router.get("/explain", async (req, res) => {
  const ip = getClientIp(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Muitas requisições. Tente novamente mais tarde." });
    return;
  }

  const q = req.query as Record<string, unknown>;
  const book    = typeof q.book    === "string" ? q.book.slice(0, 60)   : "";
  const chapter = typeof q.chapter === "string" ? q.chapter.slice(0, 4) : "";
  const verse   = typeof q.verse   === "string" ? q.verse.slice(0, 4)   : "";
  const en      = typeof q.en      === "string" ? q.en.slice(0, 500)    : "";

  if (!en) {
    res.status(400).json({ error: "Missing required query param: en" });
    return;
  }

  const ref = [book, chapter && verse ? `${chapter}:${verse}` : chapter].filter(Boolean).join(" ");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_completion_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "Você é um professor de Bíblia gentil e claro. Explique versículos bíblicos em português brasileiro simples, acessível para qualquer pessoa. Seja conciso, prático e encorajador. Máximo 80 palavras.",
        },
        {
          role: "user",
          content: `Explique de forma simples o significado de ${ref}:\n\n"${en}"\n\nO que este versículo quer dizer? Qual é a mensagem principal?`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    if (!text) {
      res.status(502).json({ error: "Explicação não gerada. Tente novamente." });
      return;
    }
    res.json({ text });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Explain generation error:", msg);
    res.status(500).json({ error: "Falha ao gerar explicação. Tente novamente." });
  }
});

export default router;
