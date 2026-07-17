"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { AdminDict } from "@/lib/admin/i18n";

export default function LoginForm({ t }: { t: AdminDict }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return; // duplicate-submit protection
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      if (res.ok) {
        const next = params.get("next");
        // Only same-site admin paths — never an open redirect.
        router.replace(next && next.startsWith("/admin") ? next : "/admin");
        router.refresh();
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(
        body.error === "rate_limited" ? t.login_error_rate :
        body.error === "not_configured" ? t.login_error_config :
        res.status === 401 ? t.login_error_invalid : t.login_error_generic,
      );
    } catch {
      setError(t.login_error_generic);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-line bg-white p-6" noValidate>
      <label className="block">
        <span className="mb-1.5 block text-[12.5px] font-medium text-ink">{t.login_email}</span>
        <input
          type="email" name="email" required autoComplete="username" autoFocus
          className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-burgundy"
        />
      </label>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-[12.5px] font-medium text-ink">{t.login_password}</span>
        <input
          type="password" name="password" required autoComplete="current-password"
          className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-[14px] text-ink outline-none focus:border-burgundy"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 rounded-md bg-status-red-soft px-3 py-2 text-[12.5px] text-status-red">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full rounded-md bg-burgundy py-2.5 text-[14px] font-medium text-[#EFE7D8] transition-colors hover:bg-burgundy-hover disabled:opacity-60"
      >
        {loading ? t.login_loading : t.login_submit}
      </button>

      <button
        type="button"
        onClick={() => setShowForgot((s) => !s)}
        className="mt-4 block w-full text-center text-[12px] text-muted underline-offset-2 hover:underline"
      >
        {t.login_forgot}
      </button>
      {showForgot && <p className="mt-2 text-center text-[12px] leading-relaxed text-muted">{t.login_forgot_hint}</p>}
    </form>
  );
}
