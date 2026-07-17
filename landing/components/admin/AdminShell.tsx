"use client";

// ── Admin shell ──────────────────────────────────────────────────────────────
// Client wrapper providing the sidebar, header and responsive behavior. Auth
// is NOT enforced here (middleware + server layout do that) — this is layout
// chrome only.

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminDict, AdminLocale } from "@/lib/admin/i18n";
import { ADMIN_LANG_COOKIE } from "@/lib/admin/i18n";

const NAV: Array<{ href: string; key: keyof AdminDict; icon: string }> = [
  { href: "/admin", key: "nav_overview", icon: "M3 12l7-8 7 8M5 10v7h4v-4h2v4h4v-7" },
  { href: "/admin/users", key: "nav_users", icon: "M10 10a3 3 0 100-6 3 3 0 000 6zM4 17c0-3 2.5-5 6-5s6 2 6 5" },
  { href: "/admin/subscriptions", key: "nav_subscriptions", icon: "M3 6h14v9H3zM3 9h14M6 12.5h3" },
  { href: "/admin/analytics", key: "nav_analytics", icon: "M4 16V9M9 16V4M14 16v-5" },
  { href: "/admin/engagement", key: "nav_engagement", icon: "M10 16s-6-3.7-6-8a3.4 3.4 0 016-2 3.4 3.4 0 016 2c0 4.3-6 8-6 8z" },
  { href: "/admin/content", key: "nav_content", icon: "M4 3h9a2 2 0 012 2v12H6a2 2 0 01-2-2zM15 14H6a2 2 0 000 3" },
  { href: "/admin/support", key: "nav_support", icon: "M10 17a7 7 0 110-14 7 7 0 010 14zM8 8a2 2 0 113.5 1.3c-.7.7-1.5 1-1.5 2M10 14h.01" },
  { href: "/admin/settings", key: "nav_settings", icon: "M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.4 1.4M13.6 13.6L15 15M15 5l-1.4 1.4M6.4 13.6L5 15" },
  { href: "/admin/audit-log", key: "nav_audit", icon: "M6 3h8a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM8 7h4M8 10h4M8 13h2" },
];

const TITLE_BY_PATH: Array<[string, keyof AdminDict]> = [
  ["/admin/users", "nav_users"],
  ["/admin/subscriptions", "nav_subscriptions"],
  ["/admin/analytics", "nav_analytics"],
  ["/admin/engagement", "nav_engagement"],
  ["/admin/content", "nav_content"],
  ["/admin/support", "nav_support"],
  ["/admin/settings", "nav_settings"],
  ["/admin/audit-log", "nav_audit"],
  ["/admin", "nav_overview"],
];

const RANGES = [
  { v: "1", key: "range_today" },
  { v: "7", key: "range_7d" },
  { v: "30", key: "range_30d" },
  { v: "90", key: "range_90d" },
  { v: "365", key: "range_12m" },
] as const;

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function AdminShell({
  t, locale, adminName, adminEmail, roleLabel, demo, children,
}: {
  t: AdminDict;
  locale: AdminLocale;
  adminName: string;
  adminEmail: string;
  roleLabel: string;
  demo: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const params = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const titleKey = TITLE_BY_PATH.find(([p]) => pathname === p || (p !== "/admin" && pathname.startsWith(p)))?.[1] ?? "nav_overview";
  const range = params.get("range") ?? "30";

  const setRange = (v: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("range", v);
    router.push(`${pathname}?${next.toString()}`);
  };

  const setLocale = (l: AdminLocale) => {
    document.cookie = `${ADMIN_LANG_COOKIE}=${l};path=/admin;max-age=31536000;samesite=strict`;
    router.refresh();
  };

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    if (typeof q === "string" && q.trim()) router.push(`/admin/users?q=${encodeURIComponent(q.trim())}`);
  };

  const sidebar = (
    <nav aria-label={t.brand} className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-2 px-4 py-5">
        <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-burgundy font-serif text-[15px] leading-none text-[#EFE7D8]">&amp;</span>
        {!collapsed && <span className="font-serif text-[15px] tracking-tight text-ink">Bread&amp;Light <span className="text-muted">Admin</span></span>}
      </Link>
      <ul className="flex-1 space-y-0.5 px-2">
        {NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                title={collapsed ? t[item.key] : undefined}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors ${
                  active ? "bg-burgundy text-[#EFE7D8]" : "text-ink hover:bg-ivory"
                }`}
              >
                <Icon d={item.icon} />
                {!collapsed && <span>{t[item.key]}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="mx-2 mb-4 hidden items-center gap-2 rounded-md px-2.5 py-2 text-[12px] text-muted hover:bg-ivory lg:flex"
        aria-label={collapsed ? t.nav_expand : t.nav_collapse}
      >
        <Icon d={collapsed ? "M8 5l5 5-5 5" : "M12 5l-5 5 5 5"} />
        {!collapsed && t.nav_collapse}
      </button>
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream text-ink">
      {/* Desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-ivory lg:block ${collapsed ? "w-[60px]" : "w-[212px]"}`}>
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/30" onClick={() => setMobileOpen(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 w-[240px] border-r border-line bg-ivory shadow-lg">{sidebar}</aside>
        </div>
      )}

      <div className={`${collapsed ? "lg:pl-[60px]" : "lg:pl-[212px]"}`}>
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-line bg-cream/95 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
            <button type="button" className="rounded-md border border-line bg-white p-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label={t.nav_expand}>
              <Icon d="M3 6h14M3 10h14M3 14h14" />
            </button>
            <h1 className="font-serif text-[19px] tracking-tight">{t[titleKey]}</h1>
            {demo && (
              <span title={t.demo_note} className="rounded-full bg-status-amber-soft px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-status-amber">
                {t.header_env_demo}
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <form onSubmit={onSearch} role="search" className="hidden md:block">
                <input
                  type="search"
                  name="q"
                  placeholder={t.header_search}
                  aria-label={t.header_search}
                  className="w-[230px] rounded-md border border-line bg-white px-3 py-1.5 text-[12.5px] placeholder:text-muted/70 focus:border-burgundy"
                />
              </form>
              <label className="flex items-center gap-1.5 text-[12px] text-muted">
                <span className="hidden sm:inline">{t.range_label}</span>
                <select
                  value={range}
                  onChange={(e) => setRange(e.target.value)}
                  className="rounded-md border border-line bg-white px-2 py-1.5 text-[12.5px] text-ink"
                >
                  {RANGES.map((r) => <option key={r.v} value={r.v}>{t[r.key]}</option>)}
                </select>
              </label>
              <button
                type="button"
                onClick={() => router.refresh()}
                title={t.header_refresh}
                aria-label={t.header_refresh}
                className="rounded-md border border-line bg-white p-2 text-muted hover:text-ink"
              >
                <Icon d="M16 10a6 6 0 11-1.8-4.3M16 3v3h-3" />
              </button>
              <details className="relative">
                <summary aria-label={t.header_account} className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-line bg-white px-2.5 py-1.5">
                  <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-burgundy text-[10px] font-semibold text-[#EFE7D8]">
                    {adminName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-[12.5px] sm:inline">{adminName}</span>
                </summary>
                <div className="absolute right-0 z-30 mt-1.5 w-56 rounded-lg border border-line bg-white p-3 shadow-sm">
                  <p className="truncate text-[13px] font-medium text-ink">{adminName}</p>
                  <p className="truncate text-[12px] text-muted">{adminEmail}</p>
                  <p className="mt-1 text-[11.5px] text-gold-ink">{roleLabel}</p>
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="mb-1.5 text-[11px] uppercase tracking-wide text-muted">{t.header_language}</p>
                    <div className="flex gap-1.5" role="group" aria-label={t.header_language}>
                      {(["pt", "en"] as const).map((l) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => setLocale(l)}
                          aria-pressed={locale === l}
                          className={`rounded-md px-2.5 py-1 text-[12px] ${locale === l ? "bg-burgundy text-[#EFE7D8]" : "border border-line text-ink"}`}
                        >
                          {l === "pt" ? "Português" : "English"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <form method="POST" action="/api/admin/logout" className="mt-3 border-t border-line pt-3">
                    <button type="submit" className="w-full rounded-md border border-line px-2.5 py-1.5 text-left text-[12.5px] text-status-red hover:bg-status-red-soft">
                      {t.header_signout}
                    </button>
                  </form>
                </div>
              </details>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1240px] px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
