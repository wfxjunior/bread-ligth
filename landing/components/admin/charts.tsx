// ── Admin chart system ───────────────────────────────────────────────────────
// Pure-SVG, dependency-free, server-rendered charts. Zero client JS means the
// dashboard stays light and the public bundle is untouched. Every chart takes
// an aria-label, renders <title> tooltips natively, and uses the calm token
// palette (burgundy line, gold accent, muted status colors).

import type { MetricPoint, CohortRow } from "@/lib/admin/data/types";

const C = {
  burgundy: "#5A1F24",
  gold: "#B38A3F",
  goldInk: "#7A5A1E",
  green: "#3E6B4F",
  red: "#8C3A32",
  blue: "#3A5A78",
  line: "#DDD4C7",
  muted: "#74695D",
  ink: "#1E1E1C",
  ivory: "#FCFAF5",
};
const SERIES_COLORS = [C.burgundy, C.gold, C.blue, C.green, C.red];

function scale(points: MetricPoint[], w: number, h: number, pad = 2, max?: number) {
  const values = points.map((p) => p.value);
  const lo = 0;
  const hi = Math.max(max ?? 0, ...values, 1);
  const x = (i: number) => pad + (i / Math.max(1, points.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - lo) / (hi - lo)) * (h - pad * 2);
  return { x, y, hi };
}

export function Sparkline({ points, tone = "burgundy", width = 84, height = 30 }: {
  points: MetricPoint[]; tone?: "burgundy" | "gold" | "green"; width?: number; height?: number;
}) {
  const color = tone === "gold" ? C.gold : tone === "green" ? C.green : C.burgundy;
  const { x, y } = scale(points, width, height);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${d} L${x(points.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0">
      <path d={area} fill={color} opacity={0.08} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  );
}

/** Line/area chart with optional previous-period comparison (dashed). */
export function LineChart({ points, compare, label, height = 180, unit = "", area = true }: {
  points: MetricPoint[]; compare?: MetricPoint[]; label: string; height?: number; unit?: string; area?: boolean;
}) {
  const w = 640;
  const all = compare ? [...points, ...compare] : points;
  const { hi } = scale(all, w, height);
  const { x, y } = scale(points, w, height, 4, hi);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const areaD = `${d} L${x(points.length - 1).toFixed(1)},${height - 4} L${x(0).toFixed(1)},${height - 4} Z`;
  let compareD = "";
  if (compare && compare.length > 1) {
    const cx = (i: number) => 4 + (i / Math.max(1, compare.length - 1)) * (w - 8);
    compareD = compare.map((p, i) => `${i === 0 ? "M" : "L"}${cx(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  }
  const gridYs = [0.25, 0.5, 0.75].map((f) => height - 4 - f * (height - 8));
  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(Math.round(n)));
  return (
    <figure aria-label={label} role="img" className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
        {gridYs.map((gy) => <line key={gy} x1={0} x2={w} y1={gy} y2={gy} stroke={C.line} strokeWidth={0.6} strokeDasharray="2 4" />)}
        {compareD && <path d={compareD} fill="none" stroke={C.muted} strokeWidth={1.2} strokeDasharray="4 4" opacity={0.7} />}
        {area && <path d={areaD} fill={C.burgundy} opacity={0.06} />}
        <path d={d} fill="none" stroke={C.burgundy} strokeWidth={1.8} strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={p.date} cx={x(i)} cy={y(p.value)} r={5} fill="transparent">
            <title>{`${p.date}: ${fmt(p.value)}${unit}`}</title>
          </circle>
        ))}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-muted">
        <span>{points[0]?.date}</span>
        <span>max {fmt(hi)}{unit}</span>
        <span>{points.at(-1)?.date}</span>
      </figcaption>
    </figure>
  );
}

export function BarChart({ points, label, height = 160, tone = "burgundy" }: {
  points: MetricPoint[]; label: string; height?: number; tone?: "burgundy" | "gold" | "red" | "green";
}) {
  const w = 640;
  const color = tone === "gold" ? C.gold : tone === "red" ? C.red : tone === "green" ? C.green : C.burgundy;
  const hi = Math.max(...points.map((p) => p.value), 1);
  const bw = Math.max(2, w / points.length - 2);
  return (
    <figure aria-label={label} role="img" className="w-full">
      <svg viewBox={`0 0 ${w} ${height}`} className="h-auto w-full" preserveAspectRatio="none">
        {points.map((p, i) => {
          const bh = Math.max(1, (p.value / hi) * (height - 16));
          return (
            <rect key={p.date} x={(i * w) / points.length + 1} y={height - bh} width={bw} height={bh} rx={1.5} fill={color} opacity={0.85}>
              <title>{`${p.date}: ${p.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <figcaption className="mt-1 flex justify-between text-[11px] text-muted">
        <span>{points[0]?.date}</span>
        <span>{points.at(-1)?.date}</span>
      </figcaption>
    </figure>
  );
}

export function Donut({ slices, label, size = 132 }: {
  slices: Array<{ name: string; value: number }>; label: string; size?: number;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = size / 2 - 8;
  const cxy = size / 2;
  let angle = -90;
  const paths = slices.map((s, i) => {
    const sweep = (s.value / total) * 360;
    const a0 = (angle * Math.PI) / 180;
    const a1 = ((angle + sweep) * Math.PI) / 180;
    angle += sweep;
    const large = sweep > 180 ? 1 : 0;
    const d = `M${cxy + r * Math.cos(a0)},${cxy + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${cxy + r * Math.cos(a1)},${cxy + r * Math.sin(a1)}`;
    return <path key={s.name} d={d} fill="none" stroke={SERIES_COLORS[i % SERIES_COLORS.length]} strokeWidth={14}><title>{`${s.name}: ${s.value} (${Math.round((s.value / total) * 100)}%)`}</title></path>;
  });
  return (
    <figure aria-label={label} role="img" className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{paths}</svg>
      <ul className="space-y-1.5">
        {slices.map((s, i) => (
          <li key={s.name} className="flex items-center gap-2 text-[12.5px] text-ink">
            <span aria-hidden className="h-2 w-2 rounded-sm" style={{ backgroundColor: SERIES_COLORS[i % SERIES_COLORS.length] }} />
            {s.name}
            <span className="text-muted">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

export function Funnel({ steps, label, dropLabel }: {
  steps: Array<{ name: string; value: number }>; label: string; dropLabel: string;
}) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <div role="img" aria-label={label} className="space-y-1.5">
      {steps.map((s, i) => {
        const pct = (s.value / max) * 100;
        const prev = i > 0 ? steps[i - 1].value : null;
        const drop = prev && prev > 0 ? Math.round((1 - s.value / prev) * 100) : null;
        return (
          <div key={s.name}>
            <div className="mb-0.5 flex items-baseline justify-between gap-4 text-[12px]">
              <span className="text-ink">{s.name}</span>
              <span className="whitespace-nowrap tabular-nums text-muted">
                {s.value.toLocaleString()}
                {drop !== null && drop > 0 && <span className="ml-2 text-status-red">−{drop}% {dropLabel}</span>}
              </span>
            </div>
            <div className="h-4 w-full rounded-sm bg-ivory">
              <div
                className="h-4 rounded-sm"
                style={{ width: `${Math.max(1.5, pct)}%`, backgroundColor: C.burgundy, opacity: 0.5 + 0.5 * (s.value / max) }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const PERIOD_LABELS = ["D0", "D1", "D7", "D30", "D60", "D90"];

export function CohortHeatmap({ cohorts, cohortLabel, sizeLabel }: {
  cohorts: CohortRow[]; cohortLabel: string; sizeLabel: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-[12px]">
        <thead>
          <tr className="text-left text-muted">
            <th className="py-1.5 pr-3 font-medium">{cohortLabel}</th>
            <th className="py-1.5 pr-3 text-right font-medium">{sizeLabel}</th>
            {PERIOD_LABELS.map((p) => <th key={p} className="px-1 py-1.5 text-center font-medium">{p}</th>)}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((c) => (
            <tr key={c.label} className="border-t border-line/60">
              <td className="py-1.5 pr-3 font-medium text-ink">{c.label}</td>
              <td className="py-1.5 pr-3 text-right tabular-nums text-muted">{c.size}</td>
              {PERIOD_LABELS.map((p, i) => {
                const v = c.retention[i];
                if (v == null) return <td key={p} className="px-1 py-1.5 text-center text-line">·</td>;
                const pct = Math.round(v * 100);
                return (
                  <td key={p} className="px-1 py-1.5 text-center">
                    <span
                      title={`${c.label} · ${p}: ${pct}%`}
                      className="inline-block w-full min-w-11 rounded-sm py-1 tabular-nums"
                      style={{ backgroundColor: `rgba(90,31,36,${0.04 + v * 0.5})`, color: v > 0.55 ? "#fff" : C.ink }}
                    >
                      {pct}%
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Ranked horizontal bars (countries, features, books…). */
export function RankedBars({ rows, label, format = (n) => n.toLocaleString() }: {
  rows: Array<{ name: string; value: number; hint?: string }>; label: string; format?: (n: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ol role="img" aria-label={label} className="space-y-2">
      {rows.map((r) => (
        <li key={r.name} className="grid grid-cols-[130px_1fr_64px] items-center gap-3 text-[12.5px]">
          <span className="truncate text-ink" title={r.name}>{r.name}</span>
          <div className="h-3 rounded-sm bg-ivory">
            <div className="h-3 rounded-sm bg-gold/70" style={{ width: `${(r.value / max) * 100}%` }} title={r.hint} />
          </div>
          <span className="text-right tabular-nums text-muted">{format(r.value)}</span>
        </li>
      ))}
    </ol>
  );
}
