import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Stores the email addresses of users who have admin access.
// Identity is still managed by Clerk — this table is a simple allowlist.
// To grant admin access: INSERT INTO admins (email) VALUES ('user@example.com');
// To revoke:             DELETE FROM admins WHERE email = 'user@example.com';
export const admins = pgTable("admins", {
  email: text("email").primaryKey(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = typeof admins.$inferInsert;
