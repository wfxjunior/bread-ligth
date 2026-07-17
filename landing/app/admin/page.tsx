import Link from "next/link";
import { adminPageContext, type SearchParams } from "@/lib/admin/page-utils";
import { computeOverviewKpis, formatMetric, pctChange, lastNDays, previousNDays } from "@/lib/admin/metrics";
import { Card, KpiCard, SectionTitle, EmptyState, StatusDot, Badge } from "@/components/admin/ui";
import { LineChart, BarChart, RankedBars } from "@/components/admin/charts";
import type { AdminDict } from "@/lib/admin/i18n";

// KPIs where an increase is bad (churn) — colors the delta arrow correctly.
const NEGATIVE_IS_GOOD = new Set(["churn_rate"]);

export default async function AdminOverviewPage({ searchParams }: { searchParams: SearchParams }) {
  const { t, locale, days, data } = await adminPageContext(searchParams);
  const kpis = computeOverviewKpis(data);
  const connected = data.series != null;

  const label = (id: string) => t[`m_${id}` as keyof AdminDict] ?? id;
  const definition = (id: string) => t[`m_${id}_def` as keyof AdminDict] ?? "";

  return (
    <div className="space-y-8">
      {/* ── KPI grid ── */}
      <section aria-label={t.ov_title}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard
              key={k.id}
              label={label(k.id)}
              definition={definition(k.id)}
              value={formatMetric(k.value, k.format, locale)}
              delta={
                k.previous != null && pctChange(k.value, k.previous) != null
                  ? { pct: pctChange(k.value, k.previous)!, positiveIsGood: !NEGATIVE_IS_GOOD.has(k.id), caption: t.compare_prev }
                  : null
              }
              spark={k.spark}
              sparkTone={k.id === "mrr" || k.id === "arr" ? "gold" : "burgundy"}
              emptyHint={t.empty_connect}
            />
          ))}
        </div>
      </section>

      {/* ── System health strip ── */}
      <section aria-label={t.ov_health}>
        <SectionTitle title={t.ov_health} />
        {data.health ? (
          <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            {data.health.every((h) => h.status === "operational") && (
              <span className="flex items-center gap-2 text-[12.5px] font-medium text-status-green">
                <StatusDot tone="green" /> {t.ov_healthy}
              </span>
            )}
            {data.health.map((h) => (
              <span key={h.id} title={h.detail} className="flex items-center gap-1.5 text-[12px] text-ink">
                <StatusDot tone={h.status === "operational" ? "green" : h.status === "degraded" ? "amber" : "red"} />
                {h.label}
              </span>
            ))}
            <Link href="/admin/settings" className="ml-auto text-[12px] text-burgundy underline-offset-2 hover:underline">
              {t.view_all}
            </Link>
          </Card>
        ) : (
          <EmptyState title={t.empty_title} body={t.h_empty} />
        )}
      </section>

      {/* ── Core charts ── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle title={t.ov_growth} hint={`${t.range_label}: ${days}d`} />
          {connected ? (
            <BarChart points={lastNDays(data.series!.registrations, days)} label={t.a_registrations} />
          ) : (
            <EmptyState title={t.empty_title} body={t.empty_body} hint={t.empty_connect} />
          )}
        </Card>
        <Card className="p-4">
          <SectionTitle title={t.ov_mrr_chart} hint={t.compare_prev} />
          {connected ? (
            <LineChart
              points={lastNDays(data.series!.mrr, days)}
              compare={previousNDays(data.series!.mrr, days)}
              label={t.ov_mrr_chart}
              unit=" USD"
            />
          ) : (
            <EmptyState title={t.empty_title} body={t.s_connect_stripe} />
          )}
        </Card>
        <Card className="p-4">
          <SectionTitle title={t.ov_dau_chart} />
          {connected ? (
            <LineChart points={lastNDays(data.series!.dau, days)} label={t.ov_dau_chart} />
          ) : (
            <EmptyState title={t.empty_title} body={t.empty_body} />
          )}
        </Card>
        <Card className="p-4">
          <SectionTitle
            title={t.ov_top_content}
            action={<Link href="/admin/content" className="text-[12px] text-burgundy underline-offset-2 hover:underline">{t.view_all}</Link>}
          />
          {data.content ? (
            <RankedBars
              rows={data.content.slice(0, 6).map((c) => ({ name: c.bookName, value: c.opens }))}
              label={t.ov_top_content}
            />
          ) : (
            <EmptyState title={t.empty_title} body={t.empty_body} />
          )}
        </Card>
      </section>

      {/* ── Recent signups ── */}
      <section aria-label={t.ov_recent_signups}>
        <SectionTitle
          title={t.ov_recent_signups}
          action={<Link href="/admin/users" className="text-[12px] text-burgundy underline-offset-2 hover:underline">{t.view_all}</Link>}
        />
        {data.users ? (
          <Card>
            <ul className="divide-y divide-line/60">
              {[...data.users]
                .sort((a, b) => b.registeredAt.localeCompare(a.registeredAt))
                .slice(0, 6)
                .map((u) => (
                  <li key={u.id}>
                    <Link href={`/admin/users/${u.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 hover:bg-ivory/60">
                      <span className="min-w-[140px] text-[13px] font-medium text-ink">{u.name}</span>
                      <span className="truncate text-[12px] text-muted">{u.email}</span>
                      <span className="text-[12px] text-muted">{u.country}</span>
                      <span className="ml-auto flex items-center gap-2">
                        <Badge tone={u.plan === "premium" ? "gold" : u.plan === "trial" ? "blue" : "neutral"}>
                          {t[`u_plan_${u.plan}` as keyof AdminDict]}
                        </Badge>
                        <span className="text-[12px] tabular-nums text-muted">{u.registeredAt}</span>
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </Card>
        ) : (
          <EmptyState title={t.empty_title} body={t.empty_body} hint={t.empty_connect} />
        )}
      </section>
    </div>
  );
}
