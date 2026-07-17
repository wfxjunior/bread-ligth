import Link from "next/link";
import { adminPageContext } from "@/lib/admin/page-utils";
import { recordAudit } from "@/lib/admin/data/audit";
import { formatMetric } from "@/lib/admin/metrics";
import { Card, SectionTitle, Badge, KeyValue, EmptyState } from "@/components/admin/ui";
import type { AdminDict } from "@/lib/admin/i18n";

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { t, locale, data, session } = await adminPageContext();
  const { id } = await params;

  const user = data.users?.find((u) => u.id === id) ?? null;
  if (!user) {
    return (
      <div className="space-y-4">
        <EmptyState title={t.ud_not_found} body={t.empty_connect} />
        <Link href="/admin/users" className="inline-block text-[13px] text-burgundy underline-offset-2 hover:underline">← {t.ud_back}</Link>
      </div>
    );
  }

  // Viewing a member record is itself an auditable action.
  recordAudit({ admin: session.email, action: "user_record_viewed", target: user.id, result: "ok" });

  const sub = data.subscriptions?.find((s) => s.userId === user.id) ?? null;
  const tickets = data.tickets?.filter((tk) => tk.userEmail === user.email) ?? [];
  const num = (v: number) => formatMetric(v, "number", locale);

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="text-[13px] text-burgundy underline-offset-2 hover:underline">← {t.ud_back}</Link>

      {/* Identity header */}
      <Card className="flex flex-wrap items-center gap-4 p-5">
        <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-burgundy font-serif text-[19px] text-[#EFE7D8]">
          {user.name.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <h2 className="font-serif text-[21px] leading-tight text-ink">{user.name}</h2>
          <p className="truncate text-[13px] text-muted">{user.email}</p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Badge tone={user.plan === "premium" ? "gold" : user.plan === "trial" ? "blue" : "neutral"}>
            {t[`u_plan_${user.plan}` as keyof AdminDict]}
          </Badge>
          <Badge tone={user.engagement === "active" ? "green" : user.engagement === "dormant" ? "amber" : "blue"}>
            {t[`u_eng_${user.engagement}` as keyof AdminDict]}
          </Badge>
          {!user.paymentHealthy && <Badge tone="red">{t.ud_payment_issue}</Badge>}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Profile */}
        <Card className="p-5">
          <SectionTitle title={t.ud_profile} />
          <KeyValue rows={[
            [t.u_country, user.country],
            [t.u_ui_lang, user.interfaceLanguage.toUpperCase()],
            [t.u_learning, user.learningLanguage.toUpperCase()],
            [t.ud_member_since, user.registeredAt],
            [t.u_last_active, user.lastActiveAt],
            [t.u_platform, user.platform],
            [t.u_source, user.acquisitionSource],
          ]} />
        </Card>

        {/* Subscription */}
        <Card className="p-5">
          <SectionTitle title={t.ud_subscription} />
          {sub ? (
            <KeyValue rows={[
              [t.u_status, sub.status],
              [t.ud_billing_interval, sub.interval],
              [t.u_registered, sub.startedAt],
              [t.ud_payment_health, user.paymentHealthy ? t.ud_payment_ok : t.ud_payment_issue],
              ["MRR", formatMetric(sub.status === "active" || sub.status === "past_due" ? sub.monthlyValueUsd : 0, "currency", locale)],
            ]} />
          ) : (
            <p className="text-[13px] text-muted">{t.u_plan_free}</p>
          )}
        </Card>

        {/* Learning journey */}
        <Card className="p-5">
          <SectionTitle title={t.ud_learning} />
          <KeyValue rows={[
            [t.u_study_days, num(user.activeStudyDays)],
            [t.u_chapters, num(user.chaptersCompleted)],
            [t.ud_books_completed, num(user.booksCompleted)],
            [t.u_words, num(user.wordsLearned)],
            [t.u_listening, formatMetric(user.listeningMinutes, "minutes", locale)],
            [t.ud_devotionals, num(user.devotionalsCompleted)],
            [t.ud_pronunciation, num(user.pronunciationSessions)],
            [t.ud_medals, num(user.medalsEarned)],
          ]} />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Support history */}
        <Card className="p-5">
          <SectionTitle title={t.ud_support} />
          {tickets.length > 0 ? (
            <ul className="divide-y divide-line/60">
              {tickets.map((tk) => (
                <li key={tk.id} className="flex items-center gap-3 py-2 text-[13px]">
                  <span className="font-medium text-ink">{tk.id}</span>
                  <span className="truncate text-muted">{tk.subject}</span>
                  <Badge tone={tk.status === "resolved" || tk.status === "closed" ? "green" : tk.status === "open" ? "amber" : "blue"}>
                    {t[`sp_${tk.status === "in_progress" ? "in_progress" : tk.status === "waiting_user" ? "waiting" : tk.status}` as keyof AdminDict]}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted">—</p>
          )}
        </Card>

        {/* Admin notes + timeline (structures ready, sources pending) */}
        <Card className="p-5">
          <SectionTitle title={t.ud_notes} />
          <p className="text-[13px] text-muted">{t.ud_notes_empty}</p>
          <p className="mt-1 text-[12px] text-muted">{t.ud_notes_hint}</p>
          <div className="mt-5 border-t border-line pt-4">
            <SectionTitle title={t.ud_timeline} />
            <p className="text-[13px] text-muted">{t.ud_timeline_empty}</p>
          </div>
        </Card>
      </div>

      {/* Privacy boundary — always visible to admins */}
      <p className="text-[12px] text-muted">🔒 {t.ud_privacy}</p>
    </div>
  );
}
