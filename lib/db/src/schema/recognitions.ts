import { pgTable, serial, text, boolean, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";

// ── Member recognitions — Community & Legacy honors ──────────────────────────
// Server-controlled and auditable: Founding Member, First 100, Beta Tester,
// Founding Premium, Contributor, etc. NEVER derived client-side — the client
// only displays what this table says. One row per (user, type) enforced by a
// unique index, so an honor can never be duplicated.
//
// Manual assignment (admin):
//   INSERT INTO member_recognitions (clerk_user_id, recognition_type, assigned_by, reason)
//   VALUES ('user_xxx', 'contributor', 'admin@example.com', 'Translation help');
export const memberRecognitions = pgTable(
  "member_recognitions",
  {
    id: serial("id").primaryKey(),
    clerkUserId: text("clerk_user_id").notNull(),
    recognitionType: text("recognition_type").notNull(), // founding_member | first_100 | beta_tester | founding_premium | contributor | ...
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    assignedBy: text("assigned_by"), // null = automatic server rule
    reason: text("reason"),
    permanent: boolean("permanent").default(true).notNull(),
    metadata: jsonb("metadata"),
  },
  (t) => [uniqueIndex("member_recognitions_user_type_idx").on(t.clerkUserId, t.recognitionType)],
);
