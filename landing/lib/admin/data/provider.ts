// ── Data source resolution ───────────────────────────────────────────────────
// One entry point decides what the dashboards see:
//
//   1. Live adapters — connected when their env vars exist (documented below).
//      None ship connected yet; each has a typed slot waiting for the
//      api-server / Stripe / events pipeline.
//   2. Demo dataset — development only (or ADMIN_DEMO_DATA=true, explicit),
//      always labeled in the UI.
//   3. Disconnected — pages receive `null` and render honest empty states.
//      Production NEVER fabricates metrics.

import type {
  AdminUser, SubscriptionRecord, SupportTicket, HealthCheck,
  MetricPoint, CohortRow, ContentRow, DataSource,
} from "./types";
import { getDemoDataset } from "./demo";

export interface AdminData {
  demo: boolean;
  sources: DataSource[];
  users: AdminUser[] | null;
  subscriptions: SubscriptionRecord[] | null;
  tickets: SupportTicket[] | null;
  health: HealthCheck[] | null;
  series: Record<string, MetricPoint[]> | null;
  cohorts: CohortRow[] | null;
  content: ContentRow[] | null;
}

export function isDemoMode(): boolean {
  if (process.env.ADMIN_DEMO_DATA === "true") return true; // explicit opt-in only
  return process.env.NODE_ENV !== "production";
}

export function getDataSources(): DataSource[] {
  const demo = isDemoMode();
  const status = (envVar: string) => Boolean(process.env[envVar]);
  return [
    { id: "app_db", label: "App database (Postgres)", connected: status("ADMIN_APP_DB_URL"), note: "Set ADMIN_APP_DB_URL (read replica of the api-server database) to power Users, Engagement and Content." },
    { id: "stripe", label: "Stripe billing", connected: status("STRIPE_SECRET_KEY"), note: "Set STRIPE_SECRET_KEY (server-side only) to power Subscriptions, MRR and churn." },
    { id: "events", label: "Product events", connected: status("ADMIN_EVENTS_URL"), note: "Point ADMIN_EVENTS_URL at the api-server events endpoint to power Analytics and funnels." },
    { id: "waitlist", label: "Waitlist", connected: status("WAITLIST_PROVIDER"), note: "Already configured via the public waitlist form when WAITLIST_PROVIDER is set." },
    { id: "support", label: "Support inbox", connected: status("ADMIN_SUPPORT_URL"), note: "Connect a support source (email forwarding or helpdesk API) to populate tickets." },
    { id: "auth", label: "Admin auth", connected: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH) || demo, note: "Configured via ADMIN_EMAIL + ADMIN_PASSWORD_HASH + ADMIN_SESSION_SECRET." },
  ];
}

/**
 * The single read path for every admin page. Marked async because live
 * adapters will fetch; the call sites are already written for that future.
 */
export async function getAdminData(): Promise<AdminData> {
  const sources = getDataSources();

  if (isDemoMode()) {
    const d = getDemoDataset();
    return { demo: true, sources, ...d };
  }

  // Production with no connected sources: every domain is null → empty states.
  // As adapters land, each null below becomes a real fetch guarded by its
  // source's `connected` flag.
  return {
    demo: false,
    sources,
    users: null,
    subscriptions: null,
    tickets: null,
    health: null,
    series: null,
    cohorts: null,
    content: null,
  };
}
