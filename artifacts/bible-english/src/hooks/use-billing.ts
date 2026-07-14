import { useAuth } from '@clerk/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchBillingPlan,
  fetchBillingStatus,
  createCheckoutSession,
  createPortalSession,
  isPremium,
  type PlanStatus,
} from '../lib/billing';

// Public pricing — no auth required, safe for signed-out visitors too.
export function useBillingPlan() {
  return useQuery({
    queryKey: ['billing', 'plan'],
    queryFn: fetchBillingPlan,
    staleTime: 5 * 60 * 1000,
  });
}

// The signed-in user's live plan status. Only enabled once Clerk has a
// session — callers should also gate on <Show when="signed-in">.
export function useBillingStatus() {
  const { isSignedIn, isLoaded, getToken } = useAuth();

  return useQuery({
    queryKey: ['billing', 'status'],
    queryFn: async (): Promise<PlanStatus> => {
      const token = await getToken();
      if (!token) throw new Error('Not signed in.');
      return fetchBillingStatus(token);
    },
    enabled: isLoaded && !!isSignedIn,
    staleTime: 30 * 1000,
  });
}

// Convenience hook: true once we've confirmed the signed-in user has an
// active or trialing Premium subscription. False while loading or signed out.
export function useIsPremium(): boolean {
  const { data } = useBillingStatus();
  return isPremium(data);
}

export function useBillingActions() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  async function startCheckout(priceId: string) {
    const token = await getToken();
    if (!token) throw new Error('Sign in required.');
    const { url } = await createCheckoutSession(token, priceId);
    window.location.href = url;
  }

  async function openBillingPortal() {
    const token = await getToken();
    if (!token) throw new Error('Sign in required.');
    const { url } = await createPortalSession(token);
    window.location.href = url;
  }

  function invalidateStatus() {
    queryClient.invalidateQueries({ queryKey: ['billing', 'status'] });
  }

  return { startCheckout, openBillingPortal, invalidateStatus };
}
