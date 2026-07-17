import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getAdminDict, normalizeAdminLocale, ADMIN_LANG_COOKIE } from "@/lib/admin/i18n";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Bread&Light Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const jar = await cookies();
  const locale = normalizeAdminLocale(jar.get(ADMIN_LANG_COOKIE)?.value);
  const t = getAdminDict(locale);

  // Operational, quiet, no marketing: wordmark, three fields, one button.
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-md bg-burgundy font-serif text-[17px] leading-none text-[#EFE7D8]">&amp;</span>
          <h1 className="font-serif text-[22px] tracking-tight text-ink">
            Bread&amp;Light <span className="text-muted">Admin</span>
          </h1>
        </div>
        <LoginForm t={t} />
        <p aria-hidden className="mt-8 text-center text-[11px] tracking-[0.2em] text-gold-ink">· · ·</p>
      </div>
    </main>
  );
}
