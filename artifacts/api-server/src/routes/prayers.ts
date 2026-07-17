import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { and, eq } from "drizzle-orm";
import { db, prayerRecords, prayerProfiles } from "@workspace/db";
import { logger } from "../lib/logger";

const router: IRouter = Router();

// ── Prayer Journey sync ──────────────────────────────────────────────────────
// Local-first backup + cross-device mirror for a user's own prayers.
//  - GET  /prayers       → the user's live prayers + prayed-days calendar
//  - POST /prayers/sync  → push local changes, receive the merged canonical set
// Merge policy: last-write-wins per prayer on the client-stamped updatedAt;
// deletions are tombstones so they propagate across devices; prayedDays is a
// set union (a day prayed on any device counts once).
// Privacy: strictly scoped to the authenticated user. Testimonies and notes
// are the user's own data, stored only for their own account.

const MAX_PRAYERS = 1000;
const MAX_PAYLOAD_BYTES = 40_000; // per prayer — titles/notes, not documents
const MAX_DAYS = 5000;

interface IncomingPrayer {
  id?: unknown;
  updatedAt?: unknown;
}

router.get("/prayers", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }
  try {
    const rows = await db
      .select()
      .from(prayerRecords)
      .where(and(eq(prayerRecords.clerkUserId, userId), eq(prayerRecords.deleted, false)));
    const [profile] = await db.select().from(prayerProfiles).where(eq(prayerProfiles.clerkUserId, userId));
    res.json({
      prayers: rows.map((r) => r.payload),
      prayedDays: profile?.prayedDays ?? [],
    });
  } catch (err) {
    logger.error({ err }, "Failed to load prayers");
    res.status(500).json({ error: "Unable to load prayers right now." });
  }
});

router.post("/prayers/sync", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in required." });
    return;
  }

  const body = req.body as { prayers?: unknown; deletedIds?: unknown; prayedDays?: unknown };
  const incoming = Array.isArray(body.prayers) ? (body.prayers as IncomingPrayer[]) : [];
  const deletedIds = Array.isArray(body.deletedIds) ? (body.deletedIds as unknown[]).filter((x): x is string => typeof x === "string") : [];
  const prayedDays = Array.isArray(body.prayedDays)
    ? (body.prayedDays as unknown[]).filter((x): x is string => typeof x === "string" && /^\d{4}-\d{2}-\d{2}$/.test(x))
    : [];

  if (incoming.length > MAX_PRAYERS || deletedIds.length > MAX_PRAYERS || prayedDays.length > MAX_DAYS) {
    res.status(413).json({ error: "Sync payload too large." });
    return;
  }

  try {
    await db.transaction(async (tx) => {
      // Upsert each incoming prayer, last-write-wins on updatedAt.
      for (const p of incoming) {
        const prayerId = typeof p.id === "string" ? p.id : null;
        const updatedRaw = typeof p.updatedAt === "string" ? new Date(p.updatedAt) : null;
        if (!prayerId || !updatedRaw || isNaN(updatedRaw.getTime())) continue;
        if (JSON.stringify(p).length > MAX_PAYLOAD_BYTES) continue;

        const [existing] = await tx
          .select({ id: prayerRecords.id, updatedAt: prayerRecords.updatedAt })
          .from(prayerRecords)
          .where(and(eq(prayerRecords.clerkUserId, userId), eq(prayerRecords.prayerId, prayerId)));

        if (!existing) {
          await tx.insert(prayerRecords).values({
            clerkUserId: userId,
            prayerId,
            payload: p,
            updatedAt: updatedRaw,
            deleted: false,
          }).onConflictDoNothing();
        } else if (existing.updatedAt.getTime() <= updatedRaw.getTime()) {
          await tx
            .update(prayerRecords)
            .set({ payload: p, updatedAt: updatedRaw, deleted: false, syncedAt: new Date() })
            .where(eq(prayerRecords.id, existing.id));
        }
      }

      // Tombstone deletions so they reach every device.
      for (const delId of deletedIds) {
        await tx
          .update(prayerRecords)
          .set({ deleted: true, syncedAt: new Date() })
          .where(and(eq(prayerRecords.clerkUserId, userId), eq(prayerRecords.prayerId, delId)));
      }

      // prayedDays: set union, capped defensively.
      const [profile] = await tx.select().from(prayerProfiles).where(eq(prayerProfiles.clerkUserId, userId));
      const union = [...new Set([...(profile?.prayedDays ?? []), ...prayedDays])].sort().slice(-MAX_DAYS);
      if (profile) {
        await tx.update(prayerProfiles).set({ prayedDays: union, updatedAt: new Date() }).where(eq(prayerProfiles.clerkUserId, userId));
      } else {
        await tx.insert(prayerProfiles).values({ clerkUserId: userId, prayedDays: union }).onConflictDoNothing();
      }
    });

    // Return the canonical merged state for the client to adopt.
    const rows = await db
      .select()
      .from(prayerRecords)
      .where(and(eq(prayerRecords.clerkUserId, userId), eq(prayerRecords.deleted, false)));
    const [profile] = await db.select().from(prayerProfiles).where(eq(prayerProfiles.clerkUserId, userId));
    res.json({ prayers: rows.map((r) => r.payload), prayedDays: profile?.prayedDays ?? [] });
  } catch (err) {
    logger.error({ err }, "Prayer sync failed");
    res.status(500).json({ error: "Sync failed. Your prayers are still safe on your device." });
  }
});

export default router;
