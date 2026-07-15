import { pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

// Stores the email addresses of users who have admin access.
// Identity is still managed by Clerk — this table is a simple allowlist.
//
// To grant admin:        INSERT INTO admins (email) VALUES ('user@example.com');
// To grant premium test: UPDATE admins SET premium_override = true WHERE email = 'user@example.com';
// To revoke admin:       DELETE FROM admins WHERE email = 'user@example.com';
export const admins = pgTable("admins", {
  email: text("email").primaryKey(),
  premiumOverride: boolean("premium_override").default(false).notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;
