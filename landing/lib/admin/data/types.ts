// ── Admin data contracts ─────────────────────────────────────────────────────
// Every dashboard reads through these types, never from a vendor SDK directly.
// When the app database / Stripe / event pipeline are connected later, only
// the adapters in provider.ts change — pages and charts stay as they are.

export type Plan = "free" | "trial" | "premium";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "expired";
export type BillingInterval = "monthly" | "annual";
export type Platform = "ios" | "android" | "web";
export type EngagementLevel = "new" | "active" | "dormant" | "reactivated";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  country: string; // ISO name, country-level only — never precise location
  interfaceLanguage: "pt" | "en";
  learningLanguage: "en" | "pt";
  registeredAt: string; // ISO date
  lastActiveAt: string; // ISO date
  plan: Plan;
  subscriptionStatus: SubscriptionStatus | null;
  billingInterval: BillingInterval | null;
  activeStudyDays: number;
  chaptersCompleted: number;
  booksCompleted: number;
  wordsLearned: number;
  wordsMastered: number;
  listeningMinutes: number;
  devotionalsCompleted: number;
  pronunciationSessions: number;
  notesCreated: number;
  medalsEarned: number;
  engagement: EngagementLevel;
  platform: Platform;
  acquisitionSource: string;
  paymentHealthy: boolean;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  interval: BillingInterval;
  startedAt: string;
  canceledAt: string | null;
  cancelReason: string | null; // null until a cancellation survey exists
  monthlyValueUsd: number; // normalized to monthly for MRR math
  country: string;
}

// Product events — mirrors the mobile app's achievement/event vocabulary so
// the pipeline can be wired to the api-server later without renaming.
export type ProductEventName =
  | "user_registered" | "onboarding_completed"
  | "chapter_opened" | "chapter_completed" | "book_started" | "book_completed"
  | "audio_started" | "audio_progressed" | "audio_completed"
  | "word_saved" | "word_mastered" | "pronunciation_completed"
  | "devotional_opened" | "devotional_completed"
  | "note_created" | "search_performed"
  | "trial_started" | "subscription_started" | "subscription_canceled"
  | "payment_failed" | "subscription_recovered" | "medal_earned"
  | "waitlist_signup" | "landing_visit";

export interface ProductEvent {
  userId: string | null;
  name: ProductEventName;
  timestamp: string;
  platform: Platform;
  country: string;
  interfaceLanguage: string;
  learningLanguage: string;
  metadata?: Record<string, string | number>; // never private note text
}

export type TicketStatus = "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "critical";
export type TicketCategory =
  | "bug" | "feature_request" | "billing" | "account" | "crash" | "translation" | "audio";

export interface SupportTicket {
  id: string;
  userEmail: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  admin: string;
  action: string;
  target: string;
  result: "ok" | "denied" | "error";
  at: string;
  meta?: string;
}

export interface HealthCheck {
  id: string;
  label: string;
  status: "operational" | "degraded" | "down" | "unknown";
  detail: string; // safe summary only — never stack traces or secrets
  lastCheckedAt: string | null;
}

export interface DataSource {
  id: "app_db" | "stripe" | "waitlist" | "events" | "support" | "auth";
  label: string;
  connected: boolean;
  note: string; // how to connect it, or what it powers
}

/** One dated numeric observation — the unit all charts consume. */
export interface MetricPoint {
  date: string; // YYYY-MM-DD
  value: number;
}

/** A registration cohort and its retention curve (fractions 0–1 per period). */
export interface CohortRow {
  label: string; // e.g. "2026-03"
  size: number;
  retention: number[]; // index 0 = period 0 (=1.0), then D7/D30... or monthly
}

/** Aggregated per-book content stats — never derived from private notes. */
export interface ContentRow {
  bookId: string;
  bookName: string;
  opens: number;
  completions: number;
  listens: number;
  savedVerses: number;
  dropOffChapter: number; // chapter with highest abandonment
}
