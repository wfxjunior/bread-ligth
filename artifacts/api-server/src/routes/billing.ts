import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { logger } from "../lib/logger";
import { billingService } from "../billing/service";

const router: IRouter = Router();

/**
 * Returns the canonical public base URL for this server.
 * Uses ONLY server-side environment variables — never request headers —
 * to prevent open-redirect / phishing attacks via Stripe redirect URLs.
 */
function getBaseUrl(): string {
  const replitDomain = process.env["REPLIT_DEV_DOMAIN"];
  if (replitDomain) return `https://${replitDomain}`;
  const publicUrl = process.env["PUBLIC_URL"];
  if (publicUrl) return publicUrl.replace(/\/$/, "");
  throw new Error(
    "Cannot determine public URL. Set REPLIT_DEV_DOMAIN (Replit) or PUBLIC_URL (production).",
  );
}

// The bible-english web app's own artifact base path — success/cancel URLs
// must send the browser back into the SPA, not to a bare server route.
const WEB_APP_BASE_PATH = "/bible-english";

// ── GET /api/billing/plan — public pricing info, sourced live from Stripe ──────
router.get("/billing/plan", async (_req, res) => {
  try {
    const prices = await billingService.getPlanPrices();
    res.json({ prices });
  } catch (err) {
    logger.error({ err }, "Failed to load billing plan prices");
    res.status(500).json({ error: "Unable to load pricing right now." });
  }
});

// ── GET /api/billing/status — the signed-in user's current plan ────────────────
router.get("/billing/status", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }

  try {
    const status = await billingService.getPlanStatus(userId);
    res.json(status);
  } catch (err) {
    logger.error({ err }, "Failed to load billing status");
    res.status(500).json({ error: "Unable to load your plan right now." });
  }
});

// ── POST /api/billing/checkout-session — start the 7-day trial ─────────────────
// Body: { priceId: string }
router.post("/billing/checkout-session", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }

  const { priceId } = req.body as { priceId: unknown };
  if (typeof priceId !== "string" || !priceId.startsWith("price_")) {
    res.status(400).json({ error: "A valid priceId is required." });
    return;
  }

  try {
    const prices = await billingService.getPlanPrices();
    if (!prices.some((p) => p.id === priceId)) {
      res.status(400).json({ error: "Unknown price." });
      return;
    }

    const base = getBaseUrl();
    const session = await billingService.createCheckoutSession(
      userId,
      priceId,
      `${base}${WEB_APP_BASE_PATH}/pricing?checkout=success`,
      `${base}${WEB_APP_BASE_PATH}/pricing?checkout=cancel`,
    );
    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "Failed to create Stripe checkout session");
    res.status(500).json({ error: "Payment service error. Please try again." });
  }
});

// ── POST /api/billing/portal-session — manage/cancel billing ───────────────────
router.post("/billing/portal-session", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }

  try {
    const base = getBaseUrl();
    const session = await billingService.createPortalSession(
      userId,
      `${base}${WEB_APP_BASE_PATH}/settings`,
    );
    res.json({ url: session.url });
  } catch (err) {
    logger.error({ err }, "Failed to create Stripe billing portal session");
    res.status(500).json({ error: "Unable to open billing management right now." });
  }
});

export default router;
