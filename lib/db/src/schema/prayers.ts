import { pgTable, serial, text, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

// ── Prayer Journey — cloud sync + future prayer groups ───────────────────────
// The mobile app is local-first: prayers live on-device and sync here as a
// per-user backup and cross-device mirror. The full Prayer object is stored as
// a JSONB payload so new client fields never require a migration; conflict
// resolution is last-write-wins on the client-stamped `updatedAt`.
//
// Privacy: rows are scoped to their clerk_user_id and the API only ever
// returns a user's own records. `group_id` is a future hook — when Prayer
// Groups launch, a prayer shared to a group gets its group's id here and a
// membership check gates reads. Nothing is shared today.

export const prayerRecords = pgTable(
  "prayer_records",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    prayerId: text("prayer_id").notNull(), // client-generated id (p_...)
    payload: jsonb("payload").notNull(), // full Prayer object from the app
    updatedAt: timestamp("updated_at").notNull(), // client clock — LWW merge key
    deleted: boolean("deleted").default(false).notNull(), // tombstone, keeps deletions in sync
    groupId: text("group_id"), // future: prayer-group sharing
    syncedAt: timestamp("synced_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("prayer_records_user_prayer_idx").on(t.clerkUserId, t.prayerId)],
);

// One row per user: the prayed-days calendar behind the prayer streak.
export const prayerProfiles = pgTable("prayer_profiles", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  prayedDays: jsonb("prayed_days").$type<string[]>().default([]).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ── Future: Prayer Groups (family, church, small groups) ─────────────────────
// Skeleton tables so the sharing feature lands as pure additions. Not yet
// exposed by any API route.
export const prayerGroups = pgTable("prayer_groups", {
  id: text("id").primaryKey(), // pg_...
  name: text("name").notNull(),
  ownerClerkUserId: text("owner_clerk_user_id").notNull(),
  kind: text("kind").default("family").notNull(), // family | church | group
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prayerGroupMembers = pgTable(
  "prayer_group_members",
  {
    id: serial("id").primaryKey(),
    groupId: text("group_id").notNull(),
    clerkUserId: text("clerk_user_id").notNull(),
    role: text("role").default("member").notNull(), // owner | member
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (t) => [uniqueIndex("prayer_group_members_group_user_idx").on(t.groupId, t.clerkUserId)],
);
