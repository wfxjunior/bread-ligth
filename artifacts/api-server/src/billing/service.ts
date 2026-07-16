import { clerkClient } from "@clerk/express";
import { getUncachableStripeClient } from "../stripeClient";
import { billingStorage } from "./storage";
import { db, admins } from "@workspace/db";
import { eq } from "drizzle-orm";

export type PlanStatus =
  | { plan: "free" }
  | {
      plan: "premium";
      status: string;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      trialEnd: number | null;
      interval: "month" | "year" | null;
    };

async function findOrCreateCustomer(clerkUserId: string): Promise<string> {
  const existing = await billingStorage.getStripeCustomerId(clerkUserId);
  if (existing) return existing;

  const stripe = await getUncachableStripeClient();
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  const email = clerkUser.primaryEmailAddress?.emailAddress;

  const customer = await stripe.customers.create({
    email,
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || undefined,
    metadata: { clerkUserId },
  });

  await billingStorage.saveStripeCustomerId(clerkUserId, customer.id);
  return customer.id;
}

export const billingService = {
  async getPlanPrices() {
    return billingStorage.getPremiumPrices();
  },

  async getPlanStatus(clerkUserId: string): Promise<PlanStatus> {
    // Check premium override first — lets admins test Premium without Stripe.
    const clerkUser = await clerkClient.users.getUser(clerkUserId);
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (email) {
      const [adminRow] = await db
        .select()
        .from(admins)
        .where(eq(admins.email, email));
      if (adminRow?.premiumOverride) {
        return {
          plan: "premium",
          status: "active",
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false,
          trialEnd: null,
          interval: null,
        };
      }
    }

    const customerId = await billingStorage.getStripeCustomerId(clerkUserId);
    if (!customerId) return { plan: "free" };

    const sub = await billingStorage.getActiveSubscriptionForCustomer(customerId);
    if (!sub) return { plan: "free" };

    const items = sub.items as { data?: Array<{ price?: { recurring?: { interval?: string } } }> } | null;
    const interval = (items?.data?.[0]?.price?.recurring?.interval as "month" | "year" | undefined) ?? null;

    return {
      plan: "premium",
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      trialEnd: sub.trial_end,
      interval,
    };
  },

  async createCheckoutSession(
    clerkUserId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    const customerId = await findOrCreateCustomer(clerkUserId);
    const stripe = await getUncachableStripeClient();

    // Grant the 7-day free trial only to customers who have never had a
    // subscription before. Stripe would otherwise silently grant a fresh trial
    // on every new subscription, so a user could cancel and resubscribe for an
    // endless string of free trials.
    const hadSubscriptionBefore =
      await billingStorage.hasPriorSubscription(customerId);

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        ...(hadSubscriptionBefore ? {} : { trial_period_days: 7 }),
        metadata: { clerkUserId },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  },

  async createPortalSession(clerkUserId: string, returnUrl: string) {
    const customerId = await billingStorage.getStripeCustomerId(clerkUserId);
    if (!customerId) {
      throw new Error("No Stripe customer on file for this user.");
    }
    const stripe = await getUncachableStripeClient();
    return stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  },
};
