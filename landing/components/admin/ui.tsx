// ── Admin UI kit ─────────────────────────────────────────────────────────────
// Small, calm building blocks shared by every admin page. Server-renderable
// (no client hooks) so pages stay fast; interactivity lives in the shell and
// DataTable only. All colors come from the design tokens in globals.css.

import type { ReactNode } from "react";
import { Sparkline } from "./charts";
import type { MetricPoint } from "@/lib/admin/data/types";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-line bg-white ${className}`}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-sans text-[13px] font-semibold uppercase tracking-[0.08em] text-muted">{title}</h2>
        {hint && <p className="mt-0.5 max-w-xl text-[12.5px] leading-snug text-muted">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

type Tone = "green" | "amber" | "red" | "blue" | "neutral" | "gold";
const TONES: Record<Tone, string> = {
  green: "bg-status-green-soft text-status-green",
  amber: "bg-status-amber-soft text-status-amber",
  red: "bg-status-red-soft text-status-red",
  blue: "bg-status-blue-soft text-status-blue",
  gold: "bg-[#F3EBDB] text-gold-ink",
  neutral: "bg-ivory text-muted",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}

export function StatusDot({ tone }: { tone: Tone }) {
  const color =
    tone === "green" ? "var(--color-status-green)" :
    tone === "amber" ? "var(--color-status-amber)" :
    tone === "red" ? "var(--color-status-red)" :
    tone === "blue" ? "var(--color-status-blue)" : "var(--color-muted)";
  return <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />;
}

/** KPI card — value, previous-period delta, sparkline, definition tooltip. */
export function KpiCard({
  label, value, delta, definition, spark, sparkTone = "burgundy", emptyHint,
}: {
  label: string;
  value: string; // pre-formatted; "—" when the source is disconnected
  delta?: { pct: number; positiveIsGood?: boolean; caption: string } | null;
  definition: string;
  spark?: MetricPoint[];
  sparkTone?: "burgundy" | "gold" | "green";
  emptyHint?: string;
}) {
  const disconnected = value === "—";
  const deltaGood = delta ? (delta.positiveIsGood === false ? delta.pct < 0 : delta.pct > 0) : null;
  return (
    <Card className="flex flex-col justify-between p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-medium leading-tight text-muted">{label}</span>
        <span
          title={definition}
          aria-label={definition}
          className="cursor-help select-none rounded-full border border-line px-1.5 text-[10px] leading-4 text-muted"
        >
          i
        </span>
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className={`font-serif text-[26px] leading-none ${disconnected ? "text-line" : "text-ink"}`}>{value}</div>
          {delta && !disconnected ? (
            <div className={`mt-1.5 text-[11.5px] font-medium ${deltaGood ? "text-status-green" : "text-status-red"}`}>
              {delta.pct > 0 ? "▲" : "▼"} {Math.abs(delta.pct).toFixed(1)}%{" "}
              <span className="font-normal text-muted">{delta.caption}</span>
            </div>
          ) : disconnected && emptyHint ? (
            <div className="mt-1.5 text-[11px] text-muted">{emptyHint}</div>
          ) : (
            <div className="mt-1.5 text-[11.5px] text-transparent" aria-hidden>·</div>
          )}
        </div>
        {spark && spark.length > 1 && !disconnected && (
          <Sparkline points={spark} tone={sparkTone} />
        )}
      </div>
    </Card>
  );
}

export function EmptyState({ title, body, hint }: { title: string; body: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-ivory px-6 py-12 text-center">
      <div aria-hidden className="mb-3 h-1.5 w-1.5 rounded-full bg-gold" />
      <p className="font-serif text-[17px] text-ink">{title}</p>
      <p className="mt-1 max-w-md text-[13px] leading-relaxed text-muted">{body}</p>
      {hint && <p className="mt-2 text-[12px] text-muted">{hint}</p>}
    </div>
  );
}

export function KeyValue({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="divide-y divide-line/60">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-6 py-2">
          <dt className="text-[12.5px] text-muted">{k}</dt>
          <dd className="text-right text-[13px] font-medium text-ink">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Skeleton block for loading.tsx files — stable size, no layout shift. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-md bg-line/40 ${className}`} />;
}
