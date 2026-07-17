// ── Admin area layout ────────────────────────────────────────────────────────
// Defense in depth: the middleware already blocked unauthenticated requests,
// and this server layout re-verifies the session before rendering anything.
// The login page has its own minimal layout (it matches /admin/login and this
// layout skips the shell for it via the route group below — login lives
// outside the shell by rendering children directly when no session exists,
// which only ever happens for /admin/login thanks to the middleware).

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin/session";
import { getAdminDict, normalizeAdminLocale, ADMIN_LANG_COOKIE } from "@/lib/admin/i18n";
import { isDemoMode } from "@/lib/admin/data/provider";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Bread&Light Admin",
  robots: { index: false, follow: false },
};

// Session cookies make every admin page request-time dynamic by nature.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
  const locale = normalizeAdminLocale(jar.get(ADMIN_LANG_COOKIE)?.value);
  const t = getAdminDict(locale);

  // No session → this can only be /admin/login (middleware redirected all
  // other admin paths). Render it bare, without the dashboard chrome.
  if (!session) return <>{children}</>;

  const roleLabel = t[`role_${session.role}` as keyof typeof t] ?? session.role;

  return (
    <AdminShell
      t={t}
      locale={locale}
      adminName={session.name}
      adminEmail={session.email}
      roleLabel={roleLabel}
      demo={isDemoMode()}
    >
      {children}
    </AdminShell>
  );
}
