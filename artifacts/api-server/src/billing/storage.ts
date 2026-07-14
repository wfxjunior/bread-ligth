import { db, userBilling } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

export interface PlanPrice {
  id: string;
  unitAmount: number;
  currency: string;
  interval: "month" | "year" | null;
}

export interface ActiveSubscriptionRow {
  id: string;
  status: string;
  current_period_end: number | null;
  cancel_at_period_end: boolean | null;
  trial_end: number | null;
  items: unknown;
}

export const billingStorage = {
  async getStripeCustomerId(clerkUserId: string): Promise<string | null> {
    const [row] = await db
      .select()
      .from(userBilling)
      .where(eq(userBilling.clerkUserId, clerkUserId));
    return row?.stripeCustomerId ?? null;
  },

  async saveStripeCustomerId(
    clerkUserId: string,
    stripeCustomerId: string,
  ): Promise<void> {
    await db
      .insert(userBilling)
      .values({ clerkUserId, stripeCustomerId })
      .onConflictDoUpdate({
        target: userBilling.clerkUserId,
        set: { stripeCustomerId },
      });
  },

  // Reads the two BreadLight Premium prices (monthly + annual) directly from
  // the stripe.prices/stripe.products tables synced by stripe-replit-sync —
  // never hardcoded, so a price change in Stripe reflects immediately.
  async getPremiumPrices(): Promise<PlanPrice[]> {
    const result = await db.execute(sql`
      SELECT pr.id, pr.unit_amount, pr.currency, pr.recurring
      FROM stripe.prices pr
      JOIN stripe.products p ON p.id = pr.product
      WHERE pr.active = true
        AND p.active = true
        AND p.metadata ->> 'app' = 'breadlight-premium'
      ORDER BY pr.unit_amount ASC
    `);
    return result.rows.map((row: any) => ({
      id: row.id as string,
      unitAmount: row.unit_amount as number,
      currency: row.currency as string,
      interval: (row.recurring?.interval as "month" | "year" | undefined) ?? null,
    }));
  },

  async getActiveSubscriptionForCustomer(
    stripeCustomerId: string,
  ): Promise<ActiveSubscriptionRow | null> {
    const result = await db.execute(sql`
      SELECT id, status, current_period_end, cancel_at_period_end, trial_end, items
      FROM stripe.subscriptions
      WHERE customer = ${stripeCustomerId}
        AND status IN ('trialing', 'active', 'past_due')
      ORDER BY created DESC
      LIMIT 1
    `);
    return (result.rows[0] as unknown as ActiveSubscriptionRow) ?? null;
  },
};
