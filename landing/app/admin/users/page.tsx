import { adminPageContext, type SearchParams } from "@/lib/admin/page-utils";
import { can } from "@/lib/admin/auth";
import { EmptyState } from "@/components/admin/ui";
import DataTable, { type ColumnDef, type FilterDef } from "@/components/admin/DataTable";

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  const { t, data, sp, session } = await adminPageContext(searchParams);
  const q = typeof sp.q === "string" ? sp.q : "";

  if (!data.users) {
    return <EmptyState title={t.empty_title} body={t.empty_body} hint={t.empty_connect} />;
  }

  const planBadges = {
    free: { label: t.u_plan_free, tone: "neutral" as const },
    trial: { label: t.u_plan_trial, tone: "blue" as const },
    premium: { label: t.u_plan_premium, tone: "gold" as const },
  };
  const engBadges = {
    new: { label: t.u_eng_new, tone: "blue" as const },
    active: { label: t.u_eng_active, tone: "green" as const },
    dormant: { label: t.u_eng_dormant, tone: "amber" as const },
    reactivated: { label: t.u_eng_reactivated, tone: "gold" as const },
  };

  const columns: ColumnDef[] = [
    { id: "name", label: t.u_name },
    { id: "email", label: t.u_email },
    { id: "country", label: t.u_country },
    { id: "interfaceLanguage", label: t.u_ui_lang },
    { id: "learningLanguage", label: t.u_learning },
    { id: "registeredAt", label: t.u_registered },
    { id: "lastActiveAt", label: t.u_last_active },
    { id: "plan", label: t.u_plan, badges: planBadges },
    { id: "activeStudyDays", label: t.u_study_days, align: "right" },
    { id: "chaptersCompleted", label: t.u_chapters, align: "right" },
    { id: "wordsLearned", label: t.u_words, align: "right" },
    { id: "listeningMinutes", label: t.u_listening, align: "right" },
    { id: "engagement", label: t.u_engagement, badges: engBadges },
    { id: "platform", label: t.u_platform },
    { id: "acquisitionSource", label: t.u_source },
  ];

  const filters: FilterDef[] = [
    { id: "plan", label: t.u_plan, options: [
      { value: "free", label: t.u_plan_free }, { value: "trial", label: t.u_plan_trial }, { value: "premium", label: t.u_plan_premium },
    ]},
    { id: "engagement", label: t.u_engagement, options: [
      { value: "new", label: t.u_eng_new }, { value: "active", label: t.u_eng_active },
      { value: "dormant", label: t.u_eng_dormant }, { value: "reactivated", label: t.u_eng_reactivated },
    ]},
    { id: "country", label: t.u_country, options: [...new Set(data.users.map((u) => u.country))].sort().map((c) => ({ value: c, label: c })) },
    { id: "platform", label: t.u_platform, options: ["ios", "android", "web"].map((p) => ({ value: p, label: p })) },
  ];

  const rows = data.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    country: u.country,
    interfaceLanguage: u.interfaceLanguage.toUpperCase(),
    learningLanguage: u.learningLanguage.toUpperCase(),
    registeredAt: u.registeredAt,
    lastActiveAt: u.lastActiveAt,
    plan: u.plan,
    activeStudyDays: u.activeStudyDays,
    chaptersCompleted: u.chaptersCompleted,
    wordsLearned: u.wordsLearned,
    listeningMinutes: u.listeningMinutes,
    engagement: u.engagement,
    platform: u.platform,
    acquisitionSource: u.acquisitionSource,
  }));

  const allowExport = can(session.role, "create_exports");

  return (
    <DataTable
      columns={columns}
      rows={rows}
      searchKeys={["name", "email", "country"]}
      filters={filters}
      hrefBase="/admin/users"
      initialQuery={q}
      exportHref={allowExport ? "/api/admin/export?type=users" : undefined}
      labels={{
        search: t.search, noResults: t.no_results, page: t.page, of: t.of,
        previous: t.previous, next: t.next, rows: t.rows,
        export: allowExport ? t.export_csv : undefined,
      }}
      allLabel={t.all}
    />
  );
}
