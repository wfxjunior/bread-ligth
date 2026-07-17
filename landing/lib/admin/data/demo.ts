// ── Demo data provider (development only) ────────────────────────────────────
// Deterministic, seeded, clearly-labeled sample data so the dashboard can be
// designed, reviewed and tested before real sources are connected. It is
// NEVER served in production unless ADMIN_DEMO_DATA=true is set explicitly,
// and the UI shows a persistent "Demo Data" badge whenever it is active.

import type {
  AdminUser, SubscriptionRecord, SupportTicket, HealthCheck,
  MetricPoint, CohortRow, ContentRow, Plan, Platform, EngagementLevel,
} from "./types";

// Small deterministic PRNG (mulberry32) — same data on every render/build.
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COUNTRIES = ["Brazil", "United States", "Portugal", "Mexico", "Colombia", "Angola", "Mozambique", "Argentina", "Canada", "Spain"];
const SOURCES = ["organic", "instagram", "youtube", "friend_referral", "app_store_search", "waitlist"];
const FIRST = ["Ana", "João", "Maria", "Pedro", "Lucas", "Julia", "Rafael", "Beatriz", "Samuel", "Ruth", "Daniel", "Ester", "Marcos", "Sara", "David", "Lídia", "Paulo", "Marta", "Tiago", "Noemi"];
const LAST = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Almeida", "Ferreira", "Ribeiro", "Martins"];
const BOOKS: Array<[string, string]> = [
  ["john", "John"], ["psalms", "Psalms"], ["genesis", "Genesis"], ["proverbs", "Proverbs"],
  ["matthew", "Matthew"], ["romans", "Romans"], ["philippians", "Philippians"], ["luke", "Luke"],
  ["james", "James"], ["isaiah", "Isaiah"], ["mark", "Mark"], ["revelation", "Revelation"],
];

const DAYS = 365;
const TODAY = new Date("2026-07-17T12:00:00Z"); // pinned so demo data is stable

function dateNDaysAgo(n: number): string {
  const d = new Date(TODAY);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

export interface DemoDataset {
  users: AdminUser[];
  subscriptions: SubscriptionRecord[];
  tickets: SupportTicket[];
  health: HealthCheck[];
  series: Record<string, MetricPoint[]>;
  cohorts: CohortRow[];
  content: ContentRow[];
}

let cache: DemoDataset | null = null;

export function getDemoDataset(): DemoDataset {
  if (cache) return cache;
  const rand = rng(20260717);
  const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

  // ── Users: growth curve that accelerates in recent months ────────────────
  const users: AdminUser[] = [];
  const subscriptions: SubscriptionRecord[] = [];
  const N_USERS = 742;
  for (let i = 0; i < N_USERS; i++) {
    // Bias registrations toward recent days (quadratic ramp).
    const ageDays = Math.floor(DAYS * (1 - Math.sqrt(rand())));
    const registeredAt = dateNDaysAgo(ageDays);
    const lastActiveDaysAgo = Math.min(ageDays, Math.floor(rand() * rand() * 45));
    const lastActiveAt = dateNDaysAgo(lastActiveDaysAgo);

    const roll = rand();
    const plan: Plan = roll < 0.11 ? "premium" : roll < 0.16 ? "trial" : "free";
    const engagement: EngagementLevel =
      ageDays < 7 ? "new" : lastActiveDaysAgo <= 7 ? "active" : lastActiveDaysAgo > 30 ? "dormant" : "reactivated";
    const platform: Platform = rand() < 0.55 ? "ios" : rand() < 0.9 ? "android" : "web";
    const studyDays = Math.max(1, Math.floor((DAYS - ageDays) * 0.02 + rand() * Math.min(120, DAYS - ageDays)));
    const country = pick(COUNTRIES);
    const isPt = country === "Brazil" || country === "Portugal" || country === "Angola" || country === "Mozambique";

    const id = `u${1000 + i}`;
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    users.push({
      id, name,
      email: `${name.toLowerCase().replace(/\s/g, ".").normalize("NFD").replace(/[̀-ͯ]/g, "")}${i}@example.com`,
      country,
      interfaceLanguage: isPt ? "pt" : "en",
      learningLanguage: isPt ? "en" : "pt",
      registeredAt, lastActiveAt, plan,
      subscriptionStatus: plan === "premium" ? (rand() < 0.06 ? "past_due" : "active") : plan === "trial" ? "trialing" : null,
      billingInterval: plan === "premium" ? (rand() < 0.35 ? "annual" : "monthly") : null,
      activeStudyDays: studyDays,
      chaptersCompleted: Math.floor(studyDays * (0.6 + rand() * 2.2)),
      booksCompleted: Math.floor(studyDays / (40 + rand() * 60)),
      wordsLearned: Math.floor(studyDays * (1.5 + rand() * 6)),
      wordsMastered: Math.floor(studyDays * rand() * 2),
      listeningMinutes: Math.floor(studyDays * (2 + rand() * 14)),
      devotionalsCompleted: Math.floor(studyDays * (0.3 + rand() * 0.6)),
      pronunciationSessions: Math.floor(studyDays * rand() * 0.8),
      notesCreated: Math.floor(studyDays * rand() * 0.4),
      medalsEarned: Math.min(24, Math.floor(studyDays / 9)),
      engagement, platform,
      acquisitionSource: pick(SOURCES),
      paymentHealthy: plan !== "premium" || rand() > 0.06,
    });

    if (plan === "premium" || plan === "trial") {
      const interval = users[i].billingInterval ?? "monthly";
      const canceled = plan === "premium" && rand() < 0.18;
      subscriptions.push({
        id: `s${2000 + i}`, userId: id,
        status: canceled ? "canceled" : plan === "trial" ? "trialing" : users[i].subscriptionStatus === "past_due" ? "past_due" : "active",
        interval,
        startedAt: registeredAt,
        canceledAt: canceled ? dateNDaysAgo(Math.floor(rand() * ageDays * 0.5)) : null,
        cancelReason: null, // survey not built yet — honest even in demo
        monthlyValueUsd: interval === "annual" ? 39.99 / 12 : 4.99,
        country,
      });
    }
  }

  // ── Daily series (last 365 days) ──────────────────────────────────────────
  const mkSeries = (base: number, growth: number, noise: number, weekly = 0.25): MetricPoint[] =>
    Array.from({ length: DAYS }, (_, idx) => {
      const n = DAYS - 1 - idx; // days ago
      const t = idx / DAYS;
      const dow = (new Date(dateNDaysAgo(n) + "T00:00:00Z").getUTCDay());
      const weekend = dow === 0 || dow === 6 ? 1 + weekly : 1;
      const value = Math.max(0, Math.round((base + growth * t * t * base) * weekend * (1 - noise / 2 + rand() * noise)));
      return { date: dateNDaysAgo(n), value };
    });

  const registrations = mkSeries(1.6, 4.5, 0.9);
  const series: Record<string, MetricPoint[]> = {
    registrations,
    dau: mkSeries(38, 3.2, 0.35),
    listening_minutes: mkSeries(420, 3.5, 0.4),
    chapters_completed: mkSeries(95, 3.1, 0.4),
    words_saved: mkSeries(140, 3.4, 0.45),
    devotionals_completed: mkSeries(30, 2.8, 0.4),
    mrr: Array.from({ length: DAYS }, (_, idx) => {
      const n = DAYS - 1 - idx;
      const t = idx / DAYS;
      return { date: dateNDaysAgo(n), value: Math.round(90 + 480 * t * t + rand() * 8) };
    }),
    new_subscriptions: mkSeries(0.35, 5, 1.2, 0),
    cancellations: mkSeries(0.12, 3.5, 1.6, 0),
    trial_starts: mkSeries(0.7, 4.5, 1.1, 0),
    trial_conversions: mkSeries(0.3, 4.5, 1.3, 0),
    landing_visits: mkSeries(60, 5, 0.5),
    waitlist_signups: mkSeries(4, 4.8, 0.9),
    payment_failures: mkSeries(0.08, 3, 2, 0),
    api_errors: mkSeries(0.4, 0.5, 2.5, 0),
  };

  // ── Retention cohorts (monthly registration cohorts × D1/D7/D30/D60/D90) ──
  const cohorts: CohortRow[] = Array.from({ length: 8 }, (_, i) => {
    const m = new Date(TODAY);
    m.setUTCMonth(m.getUTCMonth() - (7 - i));
    const label = m.toISOString().slice(0, 7);
    const size = Math.round(30 + i * i * 9 + rand() * 20);
    const d1 = 0.55 + i * 0.015 + rand() * 0.06; // newer cohorts retain better
    const curve = [1, d1, d1 * 0.62, d1 * 0.45, d1 * 0.38, d1 * 0.34].map((v) => Math.min(1, v));
    // Only show periods the cohort has lived through.
    const observable = Math.min(curve.length, 1 + Math.floor((7 - i) * 0.9) + 1);
    return { label, size, retention: curve.slice(0, Math.max(2, observable)) };
  });

  // ── Content ────────────────────────────────────────────────────────────────
  const content: ContentRow[] = BOOKS.map(([bookId, bookName], i) => {
    const w = 1 - i * 0.055;
    return {
      bookId, bookName,
      opens: Math.round(5200 * w * (0.9 + rand() * 0.3)),
      completions: Math.round(900 * w * (0.8 + rand() * 0.4)),
      listens: Math.round(2600 * w * (0.85 + rand() * 0.4)),
      savedVerses: Math.round(760 * w * (0.8 + rand() * 0.5)),
      dropOffChapter: 2 + Math.floor(rand() * 8),
    };
  });

  // ── Support tickets ────────────────────────────────────────────────────────
  const subjects: Array<[string, SupportTicket["category"]]> = [
    ["Audio stops when screen locks", "audio"],
    ["Charged twice this month", "billing"],
    ["Word translation missing accent", "translation"],
    ["App crashes on Psalms 119", "crash"],
    ["Can I change my learning language?", "account"],
    ["Please add dark sepia theme", "feature_request"],
    ["Streak reset unexpectedly", "bug"],
    ["Restore purchase not working", "billing"],
    ["Pronunciation mic permission loop", "bug"],
    ["Devotional not loading offline", "bug"],
  ];
  const statuses: SupportTicket["status"][] = ["open", "in_progress", "waiting_user", "resolved", "closed"];
  const tickets: SupportTicket[] = subjects.map(([subject, category], i) => ({
    id: `T-${120 + i}`,
    userEmail: users[Math.floor(rand() * users.length)].email,
    subject, category,
    status: statuses[Math.floor(rand() * statuses.length)],
    priority: category === "crash" || category === "billing" ? "high" : rand() < 0.12 ? "critical" : rand() < 0.5 ? "normal" : "low",
    createdAt: dateNDaysAgo(Math.floor(rand() * 30)),
    updatedAt: dateNDaysAgo(Math.floor(rand() * 5)),
  }));

  const health: HealthCheck[] = [
    { id: "api", label: "API server", status: "operational", detail: "p95 320ms · error rate 0.4%", lastCheckedAt: TODAY.toISOString() },
    { id: "auth", label: "Authentication", status: "operational", detail: "0 failures in the last hour", lastCheckedAt: TODAY.toISOString() },
    { id: "billing", label: "Billing webhooks", status: "degraded", detail: "2 retried webhooks in 24h", lastCheckedAt: TODAY.toISOString() },
    { id: "tts", label: "Audio / TTS", status: "operational", detail: "cache hit 87%", lastCheckedAt: TODAY.toISOString() },
    { id: "translate", label: "Word translation", status: "operational", detail: "fallback rate 2.1%", lastCheckedAt: TODAY.toISOString() },
    { id: "db", label: "Database", status: "operational", detail: "connections healthy", lastCheckedAt: TODAY.toISOString() },
  ];

  cache = { users, subscriptions, tickets, health, series, cohorts, content };
  return cache;
}
