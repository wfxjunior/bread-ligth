// ── Analytics event hooks ────────────────────────────────────────────────────
// Thin, provider-agnostic wrapper. No tracking library is bundled; this simply
// forwards to window.dataLayer / a global `track` if a provider is wired later
// (Plausible, PostHog, GA4, Vercel Analytics…). Safe no-op until then.
export type AnalyticsEvent =
  | "cta_primary_click"
  | "waitlist_submit"
  | "waitlist_success"
  | "pricing_toggle"
  | "language_change"
  | "app_store_click"
  | "play_store_click"
  | "faq_toggle"
  | "carousel_interact";

export function track(event: AnalyticsEvent, props?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  // Vercel Analytics custom events, if present.
  const va = (window as unknown as { va?: (e: string, n: string, p?: unknown) => void }).va;
  if (typeof va === "function") va("event", event, props);
  // Generic dataLayer fallback.
  const w = window as unknown as { dataLayer?: unknown[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...props });
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props ?? {});
  }
}
