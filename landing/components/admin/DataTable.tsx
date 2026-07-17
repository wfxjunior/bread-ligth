"use client";

// ── Generic admin data table ─────────────────────────────────────────────────
// Client-side search, filters and pagination over server-provided rows.
// Serializable props only (server pages resolve labels/i18n before passing).
// Tables scroll inside their own container — the page never overflows.

import { useMemo, useState } from "react";
import Link from "next/link";

export interface ColumnDef {
  id: string;
  label: string;
  align?: "left" | "right";
  /** Optional value→{label,tone} map rendered as a status badge. */
  badges?: Record<string, { label: string; tone: "green" | "amber" | "red" | "blue" | "neutral" | "gold" }>;
}

export interface FilterDef {
  id: string; // column id to filter on
  label: string;
  options: Array<{ value: string; label: string }>;
}

type Row = Record<string, string | number | boolean | null>;

const TONE_CLASSES: Record<string, string> = {
  green: "bg-status-green-soft text-status-green",
  amber: "bg-status-amber-soft text-status-amber",
  red: "bg-status-red-soft text-status-red",
  blue: "bg-status-blue-soft text-status-blue",
  gold: "bg-[#F3EBDB] text-gold-ink",
  neutral: "bg-ivory text-muted",
};

export default function DataTable({
  columns, rows, searchKeys, filters = [], pageSize = 15, hrefBase, initialQuery = "",
  labels, exportHref, allLabel,
}: {
  columns: ColumnDef[];
  rows: Row[];
  searchKeys: string[];
  filters?: FilterDef[];
  pageSize?: number;
  /** When set, the first column links to `${hrefBase}/${row.id}`. */
  hrefBase?: string;
  initialQuery?: string;
  labels: { search: string; noResults: string; page: string; of: string; previous: string; next: string; rows: string; export?: string };
  exportHref?: string;
  allLabel: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState<Record<string, string>>({});
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q))) return false;
      for (const [k, v] of Object.entries(active)) {
        if (v && String(r[k] ?? "") !== v) return false;
      }
      return true;
    });
  }, [rows, query, active, searchKeys]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages - 1);
  const slice = filtered.slice(current * pageSize, current * pageSize + pageSize);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(0); }}
          placeholder={labels.search}
          aria-label={labels.search}
          className="w-full max-w-[260px] rounded-md border border-line bg-white px-3 py-1.5 text-[12.5px] placeholder:text-muted/70"
        />
        {filters.map((f) => (
          <label key={f.id} className="flex items-center gap-1.5 text-[12px] text-muted">
            {f.label}
            <select
              value={active[f.id] ?? ""}
              onChange={(e) => { setActive((a) => ({ ...a, [f.id]: e.target.value })); setPage(0); }}
              className="rounded-md border border-line bg-white px-2 py-1.5 text-[12.5px] text-ink"
            >
              <option value="">{allLabel}</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        ))}
        <span className="ml-auto text-[12px] tabular-nums text-muted">{filtered.length} {labels.rows}</span>
        {exportHref && labels.export && (
          <a href={exportHref} className="rounded-md border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink hover:border-burgundy">
            {labels.export}
          </a>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-white">
        <table className="w-full min-w-[760px] border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-line bg-ivory text-left text-[11.5px] uppercase tracking-wide text-muted">
              {columns.map((c) => (
                <th key={c.id} className={`px-3 py-2.5 font-medium ${c.align === "right" ? "text-right" : ""}`}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr><td colSpan={columns.length} className="px-3 py-10 text-center text-muted">{labels.noResults}</td></tr>
            )}
            {slice.map((r, i) => (
              <tr key={String(r.id ?? i)} className="border-b border-line/50 last:border-0 hover:bg-ivory/60">
                {columns.map((c, ci) => {
                  const raw = r[c.id];
                  const badge = c.badges?.[String(raw)];
                  const content = badge ? (
                    <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-[11.5px] font-medium ${TONE_CLASSES[badge.tone]}`}>{badge.label}</span>
                  ) : (
                    <span className={typeof raw === "number" ? "tabular-nums" : ""}>{raw == null || raw === "" ? "—" : String(raw)}</span>
                  );
                  return (
                    <td key={c.id} className={`whitespace-nowrap px-3 py-2.5 ${c.align === "right" ? "text-right" : ""}`}>
                      {ci === 0 && hrefBase && r.id != null ? (
                        <Link href={`${hrefBase}/${r.id}`} className="font-medium text-burgundy underline-offset-2 hover:underline">{content}</Link>
                      ) : content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav className="mt-3 flex items-center justify-end gap-2 text-[12.5px]" aria-label={labels.page}>
          <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="rounded-md border border-line bg-white px-2.5 py-1 disabled:opacity-40">
            {labels.previous}
          </button>
          <span className="tabular-nums text-muted">{labels.page} {current + 1} {labels.of} {pages}</span>
          <button type="button" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className="rounded-md border border-line bg-white px-2.5 py-1 disabled:opacity-40">
            {labels.next}
          </button>
        </nav>
      )}
    </div>
  );
}
