import { adminPageContext, type SearchParams } from "@/lib/admin/page-utils";
import { formatMetric, lastNDays, sum } from "@/lib/admin/metrics";
import { Card, KpiCard, SectionTitle, EmptyState } from "@/components/admin/ui";
import { LineChart, RankedBars, Donut } from "@/components/admin/charts";

export default async function AdminEngagementPage({ searchParams }: { searchParams: SearchParams }) {
  const { t, locale, days, data } = await adminPageContext(searchParams);

  if (!data.series || !data.users) {
    return <EmptyState title={t.empty_title} body={t.empty_body} hint={t.empty_connect} />;
  }

  const s = data.series;
  const users = data.users;
  const range = (k: string) => sum(lastNDays(s[k], days));

  // Aggregates from user records (verified totals, not screen-opens).
  const totals = users.reduce(
    (acc, u) => {
      acc.chapters += u.chaptersCompleted;
      acc.words += u.wordsLearned;
      acc.listening += u.listeningMinutes;
      acc.devotionals += u.devotionalsCompleted;
      acc.pronunciation += u.pronunciationSessions;
      acc.notes += u.notesCreated;
      acc.medals += u.medalsEarned;
      acc.studyDays += u.activeStudyDays;
      return acc;
    },
    { chapters: 0, words: 0, listening: 0, devotionals: 0, pronunciation: 0, notes: 0, medals: 0, studyDays: 0 },
  );

  const free = users.filter((u) => u.plan === "free");
  const paid = users.filter((u) => u.plan !== "free");
  const avg = (arr: typeof users, f: (u: (typeof users)[number]) => number) =>
    arr.length ? arr.reduce((x, u) => x + f(u), 0) / arr.length : 0;

  return (
    <div className="space-y-8">
      <p className="max-w-2xl text-[12.5px] leading-relaxed text-muted">{t.e_note}</p>

      {/* ── Range KPIs ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label={t.e_chapters} definition={t.e_note} value={formatMetric(range("chapters_completed"), "number", locale)} spark={lastNDays(s.chapters_completed, days)} />
        <KpiCard label={t.e_listening} definition={t.e_note} value={formatMetric(range("listening_minutes"), "minutes", locale)} spark={lastNDays(s.listening_minutes, days)} sparkTone="gold" />
        <KpiCard label={t.e_words} definition={t.e_note} value={formatMetric(range("words_saved"), "number", locale)} spark={lastNDays(s.words_saved, days)} />
        <KpiCard label={t.e_devotionals} definition={t.e_note} value={formatMetric(range("devotionals_completed"), "number", locale)} spark={lastNDays(s.devotionals_completed, days)} sparkTone="green" />
      </div>

      {/* ── Usage over time ── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle title={`${t.e_feature_usage} — ${t.e_chapters}`} />
          <LineChart points={lastNDays(s.chapters_completed, days)} label={t.e_chapters} />
        </Card>
        <Card className="p-4">
          <SectionTitle title={`${t.e_feature_usage} — ${t.e_listening}`} />
          <LineChart points={lastNDays(s.listening_minutes, days)} label={t.e_listening} unit="min" />
        </Card>
      </section>

      {/* ── Feature ranking + reading vs listening ── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <SectionTitle title={t.e_top_features} />
          <RankedBars label={t.e_top_features} rows={[
            { name: t.e_chapters, value: totals.chapters },
            { name: t.e_words, value: totals.words },
            { name: t.e_devotionals, value: totals.devotionals },
            { name: t.ud_pronunciation, value: totals.pronunciation },
            { name: t.ud_notes, value: totals.notes },
            { name: t.ud_medals, value: totals.medals },
          ].sort((a, b) => b.value - a.value)} />
        </Card>
        <Card className="p-4">
          <SectionTitle title={t.e_read_listen} />
          <Donut label={t.e_read_listen} slices={[
            { name: t.e_chapters, value: totals.chapters },
            { name: `${t.u_listening} (h)`, value: Math.round(totals.listening / 60) },
          ]} />
        </Card>
      </section>

      {/* ── Free vs Premium ── */}
      <section>
        <Card className="p-4">
          <SectionTitle title={t.e_by_plan} />
          <RankedBars
            label={t.e_by_plan}
            format={(n) => n.toFixed(1)}
            rows={[
              { name: `${t.u_plan_premium} — ${t.u_chapters}`, value: avg(paid, (u) => u.chaptersCompleted) },
              { name: `${t.u_plan_free} — ${t.u_chapters}`, value: avg(free, (u) => u.chaptersCompleted) },
              { name: `${t.u_plan_premium} — ${t.u_study_days}`, value: avg(paid, (u) => u.activeStudyDays) },
              { name: `${t.u_plan_free} — ${t.u_study_days}`, value: avg(free, (u) => u.activeStudyDays) },
              { name: `${t.u_plan_premium} — ${t.u_listening} (min)`, value: avg(paid, (u) => u.listeningMinutes) },
              { name: `${t.u_plan_free} — ${t.u_listening} (min)`, value: avg(free, (u) => u.listeningMinutes) },
            ]}
          />
        </Card>
      </section>
    </div>
  );
}
