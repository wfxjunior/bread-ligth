import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Maps a Clerk user (our identity source — there is no local `users` table)
// to their Stripe customer. This is a relationship record only; the
// subscription/plan status itself always comes from Stripe (via the
// `stripe.subscriptions` table synced by stripe-replit-sync), never
// duplicated here.
export const userBilling = pgTable("user_billing", {
  clerkUserId: text("clerk_user_id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserBilling = typeof userBilling.$inferSelect;
export type InsertUserBilling = typeof userBilling.$inferInsert;
