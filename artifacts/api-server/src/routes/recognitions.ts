import { Router, type IRouter } from "express";
import { getAuth, createClerkClient } from "@clerk/express";
import { and, eq, sql } from "drizzle-orm";
import { db, memberRecognitions } from "@workspace/db";
import { requireAdmin } from "../middlewares/requireAdmin";
import { billingService } from "../billing/service";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

// ── Server-controlled Community & Legacy honors ───────────────────────────────
// The client never decides these. Rules:
//  - founding_member: account created before FOUNDING_DEADLINE (env, ISO date).
//  - first_100: capped at the first 100 distinct users to qualify — enforced
//    here by counting existing rows inside a transaction (idempotent per user
//    via the unique (user, type) index).
//  - founding_premium: first FOUNDING_PREMIUM_LIMIT (default 100) premium
//    subscribers.
//  - beta_tester / contributor / others: manual admin assignment only.
// premium_member is intentionally NOT stored — it reflects live billing status
// and is returned computed, so a lapsed subscription stops showing it without
// ever deleting permanent honors.

const FIRST_N_CAP = 100;
const FOUNDING_PREMIUM_CAP = Number(process.env["FOUNDING_PREMIUM_LIMIT"] ?? 100);

async function tryAward(clerkUserId: string, type: string, cap: number | null, reason: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: memberRecognitions.id })
      .from(memberRecognitions)
      .where(and(eq(memberRecognitions.clerkUserId, clerkUserId), eq(memberRecognitions.recognitionType, type)));
    if (existing) return true; // already has it — idempotent

    if (cap !== null) {
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(memberRecognitions)
        .where(eq(memberRecognitions.recognitionType, type));
      if (count >= cap) return false; // cap reached — never exceeded
    }

    await tx.insert(memberRecognitions).values({
      clerkUserId,
      recognitionType: type,
      reason,
    }).onConflictDoNothing();
    return true;
  });
}

// ── GET /api/recognitions — evaluate automatic rules + return the archive ────
router.get("/recognitions", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }

  try {
    const user = await clerk.users.getUser(userId);
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;

    // founding_member: joined before the configured launch date.
    const deadlineRaw = process.env["FOUNDING_DEADLINE"];
    if (deadlineRaw && createdAt && createdAt < new Date(deadlineRaw)) {
      await tryAward(userId, "founding_member", null, `Joined ${createdAt.toISOString()} before founding deadline`);
    }

    // first_100: first hundred users who ever hit this endpoint signed-in.
    await tryAward(userId, "first_100", FIRST_N_CAP, "Among the first 100 verified members");

    // founding_premium: first N premium subscribers.
    const plan = await billingService.getPlanStatus(userId).catch(() => null);
    const isPremium = plan?.plan === "premium";
    if (isPremium) {
      await tryAward(userId, "founding_premium", FOUNDING_PREMIUM_CAP, "Among the first founding Premium subscribers");
    }

    const rows = await db
      .select()
      .from(memberRecognitions)
      .where(eq(memberRecognitions.clerkUserId, userId));

    res.json({
      recognitions: rows.map((r) => ({
        type: r.recognitionType,
        assignedAt: r.assignedAt,
        permanent: r.permanent,
      })),
      premiumMember: isPremium, // live, computed — never stored
    });
  } catch (err) {
    logger.error({ err }, "Failed to load recognitions");
    res.status(500).json({ error: "Unable to load recognitions right now." });
  }
});

// ── POST /api/recognitions/assign — manual honors (admin only) ───────────────
// Body: { clerkUserId, type, reason }
router.post("/recognitions/assign", requireAdmin, async (req, res) => {
  const { clerkUserId, type, reason } = req.body as Record<string, unknown>;
  if (typeof clerkUserId !== "string" || typeof type !== "string" || !clerkUserId || !/^[a-z0-9_]{2,40}$/.test(type)) {
    res.status(400).json({ error: "clerkUserId and a valid type are required." });
    return;
  }
  const { userId: adminId } = getAuth(req);
  try {
    await db.insert(memberRecognitions).values({
      clerkUserId,
      recognitionType: type,
      assignedBy: adminId ?? "admin",
      reason: typeof reason === "string" ? reason.slice(0, 300) : null,
    }).onConflictDoNothing();
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to assign recognition");
    res.status(500).json({ error: "Assignment failed." });
  }
});

// ── DELETE /api/recognitions/assign — revoke a mistaken manual honor ─────────
router.delete("/recognitions/assign", requireAdmin, async (req, res) => {
  const { clerkUserId, type } = req.body as Record<string, unknown>;
  if (typeof clerkUserId !== "string" || typeof type !== "string") {
    res.status(400).json({ error: "clerkUserId and type are required." });
    return;
  }
  try {
    await db.delete(memberRecognitions).where(
      and(eq(memberRecognitions.clerkUserId, clerkUserId), eq(memberRecognitions.recognitionType, type)),
    );
    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to revoke recognition");
    res.status(500).json({ error: "Revoke failed." });
  }
});

export default router;
