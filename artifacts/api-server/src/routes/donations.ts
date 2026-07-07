import { Router } from "express";
import Stripe from "stripe";

const router = Router();

// Initialise lazily so the server starts even if the key is absent (dev without Stripe)
let stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripe) {
    const key = process.env["STRIPE_SECRET_KEY"];
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
    stripe = new Stripe(key, { apiVersion: "2026-06-24.dahlia" });
  }
  return stripe;
}

/**
 * Returns the canonical public base URL for this server.
 * Uses ONLY server-side environment variables — never request headers —
 * to prevent open-redirect / phishing attacks via Stripe redirect URLs.
 */
function getBaseUrl(): string {
  // On Replit: trusted server-side env var set by the platform
  const replitDomain = process.env["REPLIT_DEV_DOMAIN"];
  if (replitDomain) return `https://${replitDomain}`;
  // Production: set PUBLIC_URL explicitly in deployment env
  const publicUrl = process.env["PUBLIC_URL"];
  if (publicUrl) return publicUrl.replace(/\/$/, "");
  throw new Error(
    "Cannot determine public URL. Set REPLIT_DEV_DOMAIN (Replit) or PUBLIC_URL (production).",
  );
}

import { logger } from "../lib/logger.js";

// ── POST /api/donations/checkout-session ──────────────────────────────────────
// Body: { amount: number (USD cents) }
// Currency is hardcoded to USD server-side — not accepted from the client.
// Returns: { url: string, sessionId: string }
router.post("/donations/checkout-session", async (req, res) => {
  try {
    const client = getStripe();

    const { amount } = req.body as { amount: unknown };

    if (
      typeof amount !== "number" ||
      !Number.isInteger(amount) ||
      amount < 100 ||     // min $1.00
      amount > 1_000_000  // max $10,000
    ) {
      res.status(400).json({
        error: "amount must be an integer in cents between 100 and 1000000.",
      });
      return;
    }

    const base = getBaseUrl();

    const session = await client.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd", // hardcoded — never trust client-supplied currency
            product_data: {
              name: "Bread&Light — Donation",
              description:
                "Support the mission: free English learning through the Bible, forever.",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${base}/api/donations/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${base}/api/donations/cancel`,
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    // Log full detail server-side; return a generic message to the client
    logger.error({ err }, "Stripe checkout session creation failed");
    res.status(500).json({ error: "Payment service error. Please try again." });
  }
});

// ── GET /api/donations/success ────────────────────────────────────────────────
router.get("/donations/success", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Obrigado! — Bread&amp;Light</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
         background:#0A1628;color:#fff;min-height:100vh;display:flex;
         align-items:center;justify-content:center;padding:24px;text-align:center}
    .card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);
          border-radius:20px;padding:40px 32px;max-width:380px;width:100%}
    .icon{font-size:48px;margin-bottom:16px}
    h1{font-size:24px;font-weight:700;color:#D4A870;margin-bottom:10px}
    p{font-size:15px;color:rgba(255,255,255,0.65);line-height:1.6}
    .back{display:inline-block;margin-top:24px;padding:12px 28px;
          background:#D4A870;color:#0A1628;border-radius:12px;
          font-weight:600;text-decoration:none;font-size:15px}
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🙏</div>
    <h1>Obrigado pela doação!</h1>
    <p>Sua contribuição mantém o Bread&amp;Light gratuito e nos ajuda a crescer.<br/>
       Que Deus abençoe você.</p>
    <a class="back" href="javascript:window.close()">Fechar</a>
  </div>
</body>
</html>`);
});

// ── GET /api/donations/cancel ─────────────────────────────────────────────────
router.get("/donations/cancel", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Doação cancelada — Bread&amp;Light</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
         background:#0A1628;color:#fff;min-height:100vh;display:flex;
         align-items:center;justify-content:center;padding:24px;text-align:center}
    .card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);
          border-radius:20px;padding:40px 32px;max-width:380px;width:100%}
    h1{font-size:22px;font-weight:700;color:rgba(255,255,255,0.80);margin-bottom:10px}
    p{font-size:15px;color:rgba(255,255,255,0.50);line-height:1.6}
    .back{display:inline-block;margin-top:24px;padding:12px 28px;
          background:rgba(255,255,255,0.10);color:#fff;border-radius:12px;
          font-weight:600;text-decoration:none;font-size:15px}
  </style>
</head>
<body>
  <div class="card">
    <h1>Tudo bem 💛</h1>
    <p>Sua doação foi cancelada. Você pode voltar quando quiser.</p>
    <a class="back" href="javascript:window.close()">Fechar</a>
  </div>
</body>
</html>`);
});

export default router;
