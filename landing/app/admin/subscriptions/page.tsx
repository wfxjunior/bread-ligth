import { adminPageContext, type SearchParams } from "@/lib/admin/page-utils";
import { formatMetric, lastNDays, sum } from "@/lib/admin/metrics";
import { Card, KpiCard, SectionTitle, EmptyState } from "@/components/admin/ui";
import { LineChart, BarChart, Donut, RankedBars } from "@/components/admin/charts";

export default async function AdminSubscriptionsPage({ searchParams }: { searchParams: SearchParams }) {
  const { t, locale, days, data } = await adminPageContext(searchParams);

  if (!data.subscriptions || !data.series) {
    return (
      <div className="space-y-6">
        <EmptyState title={t.empty_title} body={t.s_connect_stripe} hint={t.empty_connect} />
      </div>
    );
  }

  const subs = data.subscriptions;
  const active = subs.filter((s) => s.status === "active");
  const pastDue = subs.filter((s) => s.status === "past_due");
  const trials = subs.filter((s) => s.status === "trialing");
  const payers = [...active, ...pastDue];
  const mrr = payers.reduce((s, x) => s + x.monthlyValueUsd, 0);
  const monthly = payers.filter((s) => s.interval === "monthly").length;
  const annual = payers.filter((s) => s.interval === "annual").length;

  const daysAgo = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  const canceledInRange = subs.filter((s) => s.canceledAt && daysAgo(s.canceledAt) <= days);
  const subsAtStart = payers.length + canceledInRange.length;
  const subscriberChurn = subsAtStart > 0 ? (canceledInRange.length / subsAtStart) * 100 : 0;
  const lostMrr = canceledInRange.reduce((s, x) => s + x.monthlyValueUsd, 0);
  const revenueChurn = mrr + lostMrr > 0 ? (lostMrr / (mrr + lostMrr)) * 100 : 0;
  // Involuntary churn ≈ cancellations attributable to failed payments.
  const involuntary = canceledInRange.filter((s) => {
    const u = data.users?.find((x) => x.id === s.userId);
    return u ? !u.paymentHealthy : false;
  }).length;
  const voluntary = canceledInRange.length - involuntary;

  const arpu = payers.length > 0 ? mrr / payers.length : 0;
  const monthlyChurnFrac = subscriberChurn / 100 / Math.max(1, days / 30);
  const ltv = monthlyChurnFrac > 0 ? arpu / monthlyChurnFrac : 0;

  const trialStarts = sum(lastNDays(data.series.trial_starts, days));
  const trialConvs = sum(lastNDays(data.series.trial_conversions, days));

  const churnByCountry = Object.entries(
    canceledInRange.reduce<Record<string, number>>((acc, s) => {
      acc[s.country] = (acc[s.country] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="space-y-8">
      {/* ── Subscription KPIs ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
        <KpiCard label={t.s_active} definition={t.m_premium_subs_def} value={formatMetric(payers.length, "number", locale)} spark={lastNDays(data.series.new_subscriptions, 60)} />
        <KpiCard label={t.s_monthly} definition={t.s_mix} value={formatMetric(monthly, "number", locale)} />
        <KpiCard label={t.s_annual} definition={t.s_mix} value={formatMetric(annual, "number", locale)} />
        <KpiCard label={t.s_trials} definition={t.m_trial_users_def} value={formatMetric(trials.length, "number", locale)} />
        <KpiCard label={t.m_mrr} definition={t.m_mrr_def} value={formatMetric(Math.round(mrr), "currency", locale)} spark={lastNDays(data.series.mrr, 90)} sparkTone="gold" />
        <KpiCard label={t.m_arr} definition={t.m_arr_def} value={formatMetric(Math.round(mrr * 12), "currency", locale)} />
        <KpiCard label={t.s_arpu} definition={t.s_arpu_def} value={formatMetric(arpu, "currency", locale)} />
        <KpiCard label={t.s_ltv} definition={t.s_ltv_def} value={ltv > 0 ? formatMetric(Math.round(ltv), "currency", locale) : "—"} emptyHint={t.s_ltv_def} />
      </div>

      {/* ── Charts ── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle title={t.s_new_over_time} />
          <BarChart points={lastNDays(data.series.new_subscriptions, days)} label={t.s_new_over_time} tone="green" />
        </Card>
        <Card className="p-4">
          <SectionTitle title={t.s_cancel_over_time} />
          <BarChart points={lastNDays(data.series.cancellations, days)} label={t.s_cancel_over_time} tone="red" />
        </Card>
        <Card className="p-4">
          <SectionTitle title={t.s_trial_conv_chart} hint={`${trialConvs}/${trialStarts} · ${trialStarts > 0 ? Math.round((trialConvs / trialStarts) * 100) : 0}%`} />
          <LineChart points={lastNDays(data.series.trial_conversions, days)} label={t.s_trial_conv_chart} />
        </Card>
        <Card className="grid gap-6 p-4 sm:grid-cols-2">
          <div>
            <SectionTitle title={t.s_mix} />
            <Donut label={t.s_mix} slices={[
              { name: t.s_monthly, value: monthly },
              { name: t.s_annual, value: annual },
            ]} />
          </div>
          <div>
            <SectionTitle title={t.s_status_dist} />
            <Donut label={t.s_status_dist} slices={[
              { name: t.u_eng_active, value: active.length },
              { name: t.s_trials, value: trials.length },
              { name: t.s_past_due, value: pastDue.length },
              { name: t.s_canceled_30, value: canceledInRange.length },
            ]} />
          </div>
        </Card>
      </section>

      {/* ── Churn ── */}
      <section>
        <SectionTitle title={t.c_title} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard label={t.c_subscriber} definition={t.c_subscriber_def} value={formatMetric(subscriberChurn, "percent", locale)} spark={lastNDays(data.series.cancellations, 90)} />
          <KpiCard label={t.c_revenue} definition={t.c_revenue_def} value={formatMetric(revenueChurn, "percent", locale)} />
          <KpiCard label={t.c_voluntary} definition={t.c_subscriber_def} value={formatMetric(voluntary, "number", locale)} />
          <KpiCard label={t.c_involuntary} definition={t.c_revenue_def} value={formatMetric(involuntary, "number", locale)} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Card className="p-4">
            <SectionTitle title={t.c_over_time} />
            <LineChart points={lastNDays(data.series.cancellations, Math.max(days, 30))} label={t.c_over_time} />
          </Card>
          <Card className="p-4">
            <SectionTitle title={t.c_reasons} />
            {/* Data structure exists (SubscriptionRecord.cancelReason) but the
                app doesn't run a cancellation survey yet — honest empty state. */}
            <EmptyState title={t.empty_title} body={t.c_reasons_empty} />
          </Card>
          <Card className="p-4">
            <SectionTitle title={t.c_by_interval} />
            <RankedBars label={t.c_by_interval} rows={[
              { name: t.s_monthly, value: canceledInRange.filter((s) => s.interval === "monthly").length },
              { name: t.s_annual, value: canceledInRange.filter((s) => s.interval === "annual").length },
            ]} />
          </Card>
          <Card className="p-4">
            <SectionTitle title={t.c_by_country} />
            {churnByCountry.length > 0 ? (
              <RankedBars label={t.c_by_country} rows={churnByCountry.map(([name, value]) => ({ name, value }))} />
            ) : (
              <p className="text-[13px] text-muted">—</p>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
