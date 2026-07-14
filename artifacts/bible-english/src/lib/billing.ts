// ── BreadLight Premium billing client ────────────────────────────────────────
// Thin fetch wrappers around the api-server's /api/billing/* routes. These
// routes are mounted at the top-level "/api" artifact path (see
// artifacts/api-server/src/app.ts), not under this app's own BASE_URL, so
// requests are made to root-relative "/api/..." paths directly — matching
// the same pattern the generated api-client-react package uses
// (orval.config.ts baseUrl: "/api").
//
// This feature intentionally bypasses the OpenAPI/orval codegen pipeline —
// the same lighter-weight raw-fetch pattern already used by the sibling
// donations flow (routes/donations.ts has no generated client either).

export interface BillingPrice {
  id: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
}

export type PlanStatus =
  | { plan: 'free' }
  | {
      plan: 'premium';
      status: string;
      currentPeriodEnd: number | null;
      cancelAtPeriodEnd: boolean;
      trialEnd: number | null;
      interval: 'month' | 'year' | null;
    };

class BillingApiError extends Error {}

async function parseJsonOrThrow(res: Response): Promise<any> {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new BillingApiError(data?.error ?? `Request failed (${res.status})`);
  }
  return data;
}

export async function fetchBillingPlan(): Promise<{ prices: BillingPrice[] }> {
  const res = await fetch('/api/billing/plan');
  return parseJsonOrThrow(res);
}

export async function fetchBillingStatus(token: string): Promise<PlanStatus> {
  const res = await fetch('/api/billing/status', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(res);
}

export async function createCheckoutSession(
  token: string,
  priceId: string,
): Promise<{ url: string }> {
  const res = await fetch('/api/billing/checkout-session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });
  return parseJsonOrThrow(res);
}

export async function createPortalSession(token: string): Promise<{ url: string }> {
  const res = await fetch('/api/billing/portal-session', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseJsonOrThrow(res);
}

export function isPremium(status: PlanStatus | undefined): boolean {
  return status?.plan === 'premium' && (status.status === 'active' || status.status === 'trialing');
}
