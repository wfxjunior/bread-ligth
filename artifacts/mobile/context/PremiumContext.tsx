import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useLanguage } from './LanguageContext';

// ── BreadLight Premium — mobile entitlement context ─────────────────────────
// This mirrors the shape RevenueCat's `react-native-purchases` SDK will fill
// in once the RevenueCat connector is attached to this repl. Until then it is
// an honest stub: `isPremium` is always `false` (no fake unlock), and
// `purchase`/`restore` surface a clear "not available yet" message instead of
// silently pretending to work.
//
// To wire this up for real later (see the `revenuecat` skill):
//   1. Connect the RevenueCat connector + install `react-native-purchases`
//      (this package) and `@replit/revenuecat-sdk` (workspace root, server-side).
//   2. Define a "premium" entitlement + monthly/annual packages in RevenueCat
//      matching the prices already surfaced below (from the same Stripe-backed
//      /api/billing/plan endpoint the web Pricing page reads).
//   3. Replace `refreshEntitlement` with `Purchases.getCustomerInfo()` and
//      check `customerInfo.entitlements.active['premium']`.
//   4. Replace `purchase`/`restore` with `Purchases.purchasePackage()` /
//      `Purchases.restorePurchases()`.

const _domain  = process.env.EXPO_PUBLIC_DOMAIN;
const _apiBase = _domain ? `https://${_domain}/api` : null;

export interface PremiumPrice {
  id: string;
  unitAmount: number;
  currency: string;
  interval: 'month' | 'year';
}

interface PremiumCtx {
  /** Always `false` until RevenueCat is connected and wired up — see the note above. */
  isPremium: boolean;
  /** Real, Stripe-sourced prices (same numbers as the web Pricing page) shown for reference
   *  until RevenueCat's own store products replace them. */
  prices: PremiumPrice[];
  pricesLoading: boolean;
  purchase: (priceId: string) => Promise<void>;
  restore: () => Promise<void>;
}

const PremiumContext = createContext<PremiumCtx>({
  isPremium: false,
  prices: [],
  pricesLoading: false,
  purchase: async () => {},
  restore: async () => {},
});

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [prices, setPrices] = useState<PremiumPrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(true);

  useEffect(() => {
    if (!_apiBase) { setPricesLoading(false); return; }
    let cancelled = false;
    fetch(`${_apiBase}/billing/plan`)
      .then(res => res.json())
      .then(data => { if (!cancelled && Array.isArray(data?.prices)) setPrices(data.prices); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPricesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const purchase = useCallback(async (_priceId: string) => {
    if (Platform.OS !== 'web') {
      const Haptics = await import('expo-haptics');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    // Same "coming soon" honesty already used elsewhere in Settings (the
    // previous Ambassador placeholder) — no fake success state.
    Alert.alert(t('premium_coming_soon_title'), t('premium_coming_soon_purchase_body'));
  }, [t]);

  const restore = useCallback(async () => {
    Alert.alert(t('premium_coming_soon_title'), t('premium_coming_soon_restore_body'));
  }, [t]);

  return (
    <PremiumContext.Provider value={{ isPremium: false, prices, pricesLoading, purchase, restore }}>
      {children}
    </PremiumContext.Provider>
  );
}

export const usePremium = () => useContext(PremiumContext);
