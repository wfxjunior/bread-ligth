import { adminPageContext } from "@/lib/admin/page-utils";
import { Card, SectionTitle, Badge, KeyValue, StatusDot } from "@/components/admin/ui";
import type { AdminDict } from "@/lib/admin/i18n";

const ROLE_KEYS = ["super_admin", "product_admin", "support_admin", "analytics_viewer", "billing_admin"] as const;

export default async function AdminSettingsPage() {
  const { t, data, session, locale } = await adminPageContext();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Profile */}
        <Card className="p-5">
          <SectionTitle title={t.st_profile} />
          <KeyValue rows={[
            [t.u_name, session.name],
            [t.u_email, session.email],
            [t.st_role, <Badge key="r" tone="gold">{t[`role_${session.role}` as keyof AdminDict]}</Badge>],
            [t.st_language, locale === "pt" ? "Português" : "English"],
            [t.st_default_range, t.range_30d],
          ]} />
          <p className="mt-3 text-[12px] leading-relaxed text-muted">{t.st_language_hint}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-muted">{t.st_refresh_hint}</p>
        </Card>

        {/* Security */}
        <Card className="p-5">
          <SectionTitle title={t.st_security} />
          <ul className="space-y-2.5 text-[13px] text-ink">
            <li className="flex items-start gap-2"><StatusDot tone="green" /><span>{t.st_security_session}</span></li>
            <li className="flex items-start gap-2"><StatusDot tone="green" /><span>{t.st_security_rate}</span></li>
            <li className="flex items-start gap-2"><StatusDot tone="green" /><span>{t.st_security_audit}</span></li>
          </ul>
        </Card>
      </div>

      {/* Data sources — status only, never secrets */}
      <Card className="p-5">
        <SectionTitle title={t.st_sources} />
        <ul className="divide-y divide-line/60">
          {data.sources.map((src) => (
            <li key={src.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
              <span className="min-w-[200px] text-[13px] font-medium text-ink">{src.label}</span>
              <Badge tone={src.connected ? "green" : "neutral"}>
                {src.connected ? t.st_connected : t.st_disconnected}
              </Badge>
              <span className="w-full text-[12px] leading-relaxed text-muted sm:w-auto sm:flex-1">{src.note}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Roles */}
      <Card className="p-5">
        <SectionTitle title={t.st_roles_title} hint={t.st_roles_hint} />
        <div className="flex flex-wrap gap-2">
          {ROLE_KEYS.map((r) => (
            <Badge key={r} tone={r === session.role ? "gold" : "neutral"}>
              {t[`role_${r}` as keyof AdminDict]}
            </Badge>
          ))}
        </div>
      </Card>

      {/* System health detail */}
      <Card className="p-5">
        <SectionTitle title={t.h_title} />
        {data.health ? (
          <ul className="divide-y divide-line/60">
            {data.health.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="flex min-w-[200px] items-center gap-2 text-[13px] font-medium text-ink">
                  <StatusDot tone={h.status === "operational" ? "green" : h.status === "degraded" ? "amber" : h.status === "down" ? "red" : "neutral"} />
                  {h.label}
                </span>
                <Badge tone={h.status === "operational" ? "green" : h.status === "degraded" ? "amber" : "red"}>
                  {t[`h_${h.status}` as keyof AdminDict]}
                </Badge>
                <span className="text-[12px] text-muted">{h.detail}</span>
                {h.lastCheckedAt && (
                  <span className="ml-auto text-[11.5px] tabular-nums text-muted">
                    {t.h_last_check}: {h.lastCheckedAt.slice(0, 16).replace("T", " ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13px] text-muted">{t.h_empty}</p>
        )}
      </Card>
    </div>
  );
}
