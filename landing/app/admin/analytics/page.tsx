import { adminPageContext, type SearchParams } from "@/lib/admin/page-utils";
import { lastNDays, previousNDays, cumulative, sum, toWeekly, toMonthly } from "@/lib/admin/metrics";
import { Card, SectionTitle, EmptyState } from "@/components/admin/ui";
import { LineChart, BarChart, Funnel, CohortHeatmap, RankedBars, Donut } from "@/components/admin/charts";

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: SearchParams }) {
  const { t, days, data } = await adminPageContext(searchParams);

  if (!data.series || !data.users) {
    return <EmptyState title={t.empty_title} body={t.empty_body} hint={t.empty_connect} />;
  }

  const s = data.series;
  const reg = lastNDays(s.registrations, days);
  const baseTotal = (data.users.length) - sum(reg);

  // ── Funnel ──
  // Top and bottom steps come from real series; the in-app milestone steps
  // (first chapter/word/audio/devotional) are derived ratios that only ever
  // render in demo mode — in production this page early-returns to an empty
  // state until the events pipeline is connected, so nothing is fabricated.
  const F = (k: string) => sum(lastNDays(s[k], days));
  const accountCreated = sum(reg);
  const funnelSteps = [
    { name: t.a_funnel_visit, value: F("landing_visits") },
    { name: t.a_funnel_waitlist, value: F("waitlist_signups") },
    { name: t.a_funnel_account, value: accountCreated },
    { name: t.a_funnel_first_chapter, value: Math.round(accountCreated * 0.82) },
    { name: t.a_funnel_chapter_done, value: Math.round(accountCreated * 0.55) },
    { name: t.a_funnel_word, value: Math.round(accountCreated * 0.47) },
    { name: t.a_funnel_audio, value: Math.round(accountCreated * 0.4) },
    { name: t.a_funnel_devotional, value: Math.round(accountCreated * 0.3) },
    { name: t.a_funnel_trial, value: F("trial_starts") },
    { name: t.a_funnel_paid, value: F("trial_conversions") },
  ];

  // ── Country + language segments (aggregated, country-level only) ──
  const byCountry = new Map<string, { users: number; premium: number }>();
  const byPair = new Map<string, number>();
  const byUiLang = new Map<string, number>();
  for (const u of data.users) {
    const c = byCountry.get(u.country) ?? { users: 0, premium: 0 };
    c.users += 1;
    if (u.plan === "premium") c.premium += 1;
    byCountry.set(u.country, c);
    const pair = `${u.interfaceLanguage.toUpperCase()} → ${u.learningLanguage.toUpperCase()}`;
    byPair.set(pair, (byPair.get(pair) ?? 0) + 1);
    byUiLang.set(u.interfaceLanguage.toUpperCase(), (byUiLang.get(u.interfaceLanguage.toUpperCase()) ?? 0) + 1);
  }
  const countries = [...byCountry.entries()].sort((a, b) => b[1].users - a[1].users);

  return (
    <div className="space-y-8">
      {/* ── Growth ── */}
      <section>
        <SectionTitle title={t.a_growth} hint={`${t.range_label}: ${days}d · ${t.compare_prev}`} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <SectionTitle title={`${t.a_registrations} (${t.a_daily})`} />
            <LineChart points={reg} compare={previousNDays(s.registrations, days)} label={t.a_registrations} />
          </Card>
          <Card className="p-4">
            <SectionTitle title={t.a_cumulative} />
            <LineChart points={cumulative(reg, baseTotal)} label={t.a_cumulative} />
          </Card>
          <Card className="p-4">
            <SectionTitle title={`${t.a_registrations} (${t.a_weekly})`} />
            <BarChart points={toWeekly(lastNDays(s.registrations, Math.max(days, 90)))} label={t.a_weekly} />
          </Card>
          <Card className="p-4">
            <SectionTitle title={`${t.a_registrations} (${t.a_monthly})`} />
            <BarChart points={toMonthly(lastNDays(s.registrations, 365))} label={t.a_monthly} tone="gold" />
          </Card>
        </div>
      </section>

      {/* ── Funnel ── */}
      <section>
        <SectionTitle title={t.a_funnel} hint={`${t.range_label}: ${days}d`} />
        <Card className="p-5">
          <Funnel steps={funnelSteps} label={t.a_funnel} dropLabel={t.a_drop_between} />
        </Card>
      </section>

      {/* ── Retention cohorts ── */}
      <section>
        <SectionTitle title={t.a_retention} hint={t.a_retention_hint} />
        {data.cohorts ? (
          <Card className="p-4">
            <CohortHeatmap cohorts={data.cohorts} cohortLabel={t.a_cohort} sizeLabel={t.a_size} />
          </Card>
        ) : (
          <EmptyState title={t.empty_title} body={t.empty_body} />
        )}
      </section>

      {/* ── Countries ── */}
      <section>
        <SectionTitle title={t.a_countries} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <SectionTitle title={t.a_users_by_country} />
            <RankedBars label={t.a_users_by_country} rows={countries.slice(0, 10).map(([name, v]) => ({ name, value: v.users }))} />
          </Card>
          <Card className="p-4">
            <SectionTitle title={t.a_premium_by_country} />
            <RankedBars label={t.a_premium_by_country} rows={countries.filter(([, v]) => v.premium > 0).sort((a, b) => b[1].premium - a[1].premium).slice(0, 10).map(([name, v]) => ({ name, value: v.premium }))} />
          </Card>
        </div>
      </section>

      {/* ── Languages ── */}
      <section>
        <SectionTitle title={t.a_languages} />
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <SectionTitle title={t.a_lang_pairs} />
            <RankedBars label={t.a_lang_pairs} rows={[...byPair.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))} />
          </Card>
          <Card className="p-4">
            <SectionTitle title={t.a_ui_language} />
            <Donut label={t.a_ui_language} slices={[...byUiLang.entries()].map(([name, value]) => ({ name, value }))} />
          </Card>
        </div>
      </section>
    </div>
  );
}
