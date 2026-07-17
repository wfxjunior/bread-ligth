// ── Centralized metric definitions ───────────────────────────────────────────
// Every number on the dashboard is computed HERE, once, with its definition
// documented next to the code that produces it. Pages never re-derive churn,
// "active user" or MRR with their own math — that is how dashboards start
// disagreeing with themselves.

import type { AdminData } from "./data/provider";
import type { MetricPoint } from "./data/types";

export type MetricFormat = "number" | "currency" | "percent" | "minutes";

export interface Kpi {
  id: string;
  value: number | null; // null = source not connected
  previous: number | null;
  format: MetricFormat;
  spark?: MetricPoint[];
}

// ── Series helpers ────────────────────────────────────────────────────────────
export function lastNDays(series: MetricPoint[] | undefined, days: number): MetricPoint[] {
  if (!series) return [];
  return series.slice(-days);
}
export function previousNDays(series: MetricPoint[] | undefined, days: number): MetricPoint[] {
  if (!series) return [];
  return series.slice(-(days * 2), -days);
}
export function sum(points: MetricPoint[]): number {
  return points.reduce((s, p) => s + p.value, 0);
}
export function cumulative(points: MetricPoint[], start = 0): MetricPoint[] {
  let acc = start;
  return points.map((p) => ({ date: p.date, value: (acc += p.value) }));
}
export function toWeekly(points: MetricPoint[]): MetricPoint[] {
  const out: MetricPoint[] = [];
  for (let i = 0; i < points.length; i += 7) {
    const chunk = points.slice(i, i + 7);
    out.push({ date: chunk[0].date, value: sum(chunk) });
  }
  return out;
}
export function toMonthly(points: MetricPoint[]): MetricPoint[] {
  const map = new Map<string, number>();
  for (const p of points) map.set(p.date.slice(0, 7), (map.get(p.date.slice(0, 7)) ?? 0) + p.value);
  return [...map.entries()].map(([date, value]) => ({ date, value }));
}
export function pctChange(current: number | null, previous: number | null): number | null {
  if (current == null || previous == null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

const DAY_MS = 86400000;
function daysSince(iso: string): number {
  return Math.floor((Date.now() - new Date(iso + (iso.length === 10 ? "T00:00:00Z" : "")).getTime()) / DAY_MS);
}

// ── Overview KPIs ─────────────────────────────────────────────────────────────
// Definitions (surfaced as tooltips through i18n keys m_<id>_def):
//   total_users        All registered accounts, lifetime.
//   new_today/new_week Registrations in the current day / last 7 days.
//   dau / mau          Distinct users active in the last 1 / 30 days.
//   premium/trial/free Current plan split.
//   mrr                Sum of active subscriptions normalized to monthly value.
//   arr                MRR × 12.
//   churn_rate         Subscribers canceling in the last 30 days ÷ subscribers
//                      that were active at the start of that window.
//   trial_conversion   Trials converting to paid ÷ trials started (30 days).
export function computeOverviewKpis(data: AdminData): Kpi[] {
  const { users, subscriptions, series } = data;
  const nullKpi = (id: string, format: MetricFormat = "number"): Kpi => ({ id, value: null, previous: null, format });
  if (!users || !subscriptions || !series) {
    return [
      "total_users", "new_today", "new_week", "mau", "dau", "premium_subs",
      "trial_users", "free_users", "mrr", "arr", "churn_rate", "trial_conversion",
    ].map((id) =>
      nullKpi(id, id === "mrr" || id === "arr" ? "currency" : id.includes("rate") || id.includes("conversion") ? "percent" : "number"),
    );
  }

  const reg = series.registrations ?? [];
  const dauS = series.dau ?? [];
  const active30 = users.filter((u) => daysSince(u.lastActiveAt) <= 30).length;
  const activeSubs = subscriptions.filter((s) => s.status === "active" || s.status === "past_due");
  const mrrNow = activeSubs.reduce((s, x) => s + x.monthlyValueUsd, 0);
  const mrrS = series.mrr ?? [];
  const mrrPrev =
    mrrS.length > 31 && (mrrS.at(-1)?.value ?? 0) > 0
      ? Math.round(mrrNow * (mrrS.at(-31)!.value / mrrS.at(-1)!.value))
      : null;
  const canceled30 = subscriptions.filter((s) => s.canceledAt && daysSince(s.canceledAt) <= 30).length;
  const subsAtStart = activeSubs.length + canceled30;
  const trialStarts30 = sum(lastNDays(series.trial_starts, 30));
  const trialConv30 = sum(lastNDays(series.trial_conversions, 30));
  const trialStartsPrev = sum(previousNDays(series.trial_starts, 30));
  const trialConvPrev = sum(previousNDays(series.trial_conversions, 30));

  const counts = {
    premium: users.filter((u) => u.plan === "premium").length,
    trial: users.filter((u) => u.plan === "trial").length,
    free: users.filter((u) => u.plan === "free").length,
  };

  return [
    { id: "total_users", value: users.length, previous: users.length - sum(lastNDays(reg, 30)), format: "number", spark: cumulative(lastNDays(reg, 30), users.length - sum(lastNDays(reg, 30))) },
    { id: "new_today", value: reg.at(-1)?.value ?? 0, previous: reg.at(-2)?.value ?? null, format: "number", spark: lastNDays(reg, 14) },
    { id: "new_week", value: sum(lastNDays(reg, 7)), previous: sum(previousNDays(reg, 7)), format: "number", spark: lastNDays(reg, 28) },
    { id: "mau", value: active30, previous: null, format: "number", spark: lastNDays(dauS, 30) },
    { id: "dau", value: dauS.at(-1)?.value ?? 0, previous: dauS.at(-8)?.value ?? null, format: "number", spark: lastNDays(dauS, 30) },
    { id: "premium_subs", value: counts.premium, previous: null, format: "number", spark: lastNDays(series.new_subscriptions, 30) },
    { id: "trial_users", value: counts.trial, previous: null, format: "number", spark: lastNDays(series.trial_starts, 30) },
    { id: "free_users", value: counts.free, previous: null, format: "number" },
    // Previous MRR/ARR: scale today's subscription-derived MRR by the series'
    // 30-day shape, so value and delta always come from ONE definition and
    // can never disagree with each other.
    { id: "mrr", value: Math.round(mrrNow), previous: mrrPrev, format: "currency", spark: lastNDays(mrrS, 90) },
    { id: "arr", value: Math.round(mrrNow * 12), previous: mrrPrev != null ? mrrPrev * 12 : null, format: "currency" },
    { id: "churn_rate", value: subsAtStart > 0 ? (canceled30 / subsAtStart) * 100 : 0, previous: null, format: "percent", spark: lastNDays(series.cancellations, 60) },
    { id: "trial_conversion", value: trialStarts30 > 0 ? (trialConv30 / trialStarts30) * 100 : 0, previous: trialStartsPrev > 0 ? (trialConvPrev / trialStartsPrev) * 100 : null, format: "percent", spark: lastNDays(series.trial_conversions, 30) },
  ];
}

// ── Formatting (locale-aware, done once) ─────────────────────────────────────
export function formatMetric(value: number | null, format: MetricFormat, locale: string): string {
  if (value == null) return "—";
  const loc = locale === "pt" ? "pt-BR" : "en-US";
  switch (format) {
    case "currency":
      return new Intl.NumberFormat(loc, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
    case "percent":
      return `${new Intl.NumberFormat(loc, { maximumFractionDigits: 1 }).format(value)}%`;
    case "minutes": {
      if (value >= 60) return `${new Intl.NumberFormat(loc, { maximumFractionDigits: 1 }).format(value / 60)}h`;
      return `${Math.round(value)}min`;
    }
    default:
      return new Intl.NumberFormat(loc, { notation: value >= 100000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
  }
}
