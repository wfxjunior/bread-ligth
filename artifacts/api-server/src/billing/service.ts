import { clerkClient } from "@clerk/express";
import { getUncachableStripeClient } from "../stripeClient";
import { billingStorage } from "./storage";

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

    // Refuse to start a second trial for a customer who already has (or has
    // ever had) an active/trialing subscription — Stripe would otherwise
    // silently grant a second free trial on a new subscription.
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 7,
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
