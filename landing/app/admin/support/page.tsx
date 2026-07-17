import { adminPageContext, type SearchParams } from "@/lib/admin/page-utils";
import { EmptyState } from "@/components/admin/ui";
import DataTable, { type ColumnDef, type FilterDef } from "@/components/admin/DataTable";

export default async function AdminSupportPage({ searchParams }: { searchParams: SearchParams }) {
  const { t, data } = await adminPageContext(searchParams);

  if (!data.tickets) {
    return <EmptyState title={t.empty_title} body={t.sp_empty} hint={t.empty_connect} />;
  }

  const statusBadges = {
    open: { label: t.sp_open, tone: "amber" as const },
    in_progress: { label: t.sp_in_progress, tone: "blue" as const },
    waiting_user: { label: t.sp_waiting, tone: "neutral" as const },
    resolved: { label: t.sp_resolved, tone: "green" as const },
    closed: { label: t.sp_closed, tone: "neutral" as const },
  };
  const priorityBadges = {
    low: { label: t.sp_low, tone: "neutral" as const },
    normal: { label: t.sp_normal, tone: "blue" as const },
    high: { label: t.sp_high, tone: "amber" as const },
    critical: { label: t.sp_critical, tone: "red" as const },
  };
  const catLabels: Record<string, string> = {
    bug: t.sp_cat_bug, feature_request: t.sp_cat_feature, billing: t.sp_cat_billing,
    account: t.sp_cat_account, crash: t.sp_cat_crash, translation: t.sp_cat_translation, audio: t.sp_cat_audio,
  };

  const columns: ColumnDef[] = [
    { id: "ticket", label: t.sp_id },
    { id: "userEmail", label: t.sp_user },
    { id: "subject", label: t.sp_subject },
    { id: "category", label: t.sp_category },
    { id: "status", label: t.sp_status, badges: statusBadges },
    { id: "priority", label: t.sp_priority, badges: priorityBadges },
    { id: "updatedAt", label: t.sp_updated },
  ];

  const filters: FilterDef[] = [
    { id: "status", label: t.sp_status, options: Object.entries(statusBadges).map(([value, b]) => ({ value, label: b.label })) },
    { id: "priority", label: t.sp_priority, options: Object.entries(priorityBadges).map(([value, b]) => ({ value, label: b.label })) },
  ];

  const rows = data.tickets.map((tk) => ({
    id: tk.id,
    ticket: tk.id,
    userEmail: tk.userEmail,
    subject: tk.subject,
    category: catLabels[tk.category] ?? tk.category,
    status: tk.status,
    priority: tk.priority,
    updatedAt: tk.updatedAt,
  }));

  return (
    <DataTable
      columns={columns}
      rows={rows}
      searchKeys={["ticket", "userEmail", "subject"]}
      filters={filters}
      labels={{ search: t.search, noResults: t.no_results, page: t.page, of: t.of, previous: t.previous, next: t.next, rows: t.rows }}
      allLabel={t.all}
    />
  );
}
