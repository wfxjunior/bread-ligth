import { adminPageContext } from "@/lib/admin/page-utils";
import { getAuditEntries } from "@/lib/admin/data/audit";
import { getDemoDataset } from "@/lib/admin/data/demo";
import { isDemoMode } from "@/lib/admin/data/provider";
import { Card, SectionTitle, Badge, EmptyState } from "@/components/admin/ui";
import type { AuditEntry } from "@/lib/admin/data/types";

// A handful of representative demo entries so the log is designable in dev.
function demoEntries(): AuditEntry[] {
  const u = getDemoDataset().users;
  const now = Date.now();
  const mk = (i: number, admin: string, action: string, target: string, result: AuditEntry["result"]): AuditEntry => ({
    id: `d${i}`, admin, action, target, result, at: new Date(now - i * 47 * 60000).toISOString(),
  });
  return [
    mk(1, "admin@breadlight.app", "admin_login", "203.0.113.10", "ok"),
    mk(2, "admin@breadlight.app", "user_record_viewed", u[3]?.id ?? "u1003", "ok"),
    mk(3, "admin@breadlight.app", "export_created", "users.csv", "ok"),
    mk(4, "support@breadlight.app", "support_ticket_updated", "T-124", "ok"),
    mk(5, "admin@breadlight.app", "manual_medal_assigned", `${u[10]?.id ?? "u1010"} · beta_tester`, "ok"),
    mk(6, "unknown@example.com", "admin_login_failed", "198.51.100.7", "denied"),
    mk(7, "admin@breadlight.app", "settings_changed", "admin_language", "ok"),
  ];
}

export default async function AdminAuditLogPage() {
  const { t } = await adminPageContext();
  const runtime = getAuditEntries();
  const entries = runtime.length > 0 ? runtime : isDemoMode() ? demoEntries() : [];

  return (
    <div className="space-y-4">
      <SectionTitle title={t.au_title} hint={t.au_volatile} />
      {entries.length === 0 ? (
        <EmptyState title={t.empty_title} body={t.au_empty} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-line bg-ivory text-left text-[11.5px] uppercase tracking-wide text-muted">
                  <th className="px-3 py-2.5 font-medium">{t.au_when}</th>
                  <th className="px-3 py-2.5 font-medium">{t.au_admin}</th>
                  <th className="px-3 py-2.5 font-medium">{t.au_action}</th>
                  <th className="px-3 py-2.5 font-medium">{t.au_target}</th>
                  <th className="px-3 py-2.5 font-medium">{t.au_result}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-line/50 last:border-0">
                    <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted">{e.at.slice(0, 16).replace("T", " ")}</td>
                    <td className="px-3 py-2.5 text-ink">{e.admin}</td>
                    <td className="px-3 py-2.5"><code className="rounded bg-ivory px-1.5 py-0.5 text-[11.5px]">{e.action}</code></td>
                    <td className="px-3 py-2.5 text-muted">{e.target}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={e.result === "ok" ? "green" : e.result === "denied" ? "amber" : "red"}>{e.result}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
