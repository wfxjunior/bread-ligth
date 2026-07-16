"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { IconGlobe, IconChevron } from "@/components/icons";

export function LanguageSelector({ onDark = false }: { onDark?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (l: Locale) => {
    setLocale(l);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.language}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors ${
          onDark ? "text-onDark hover:text-white" : "text-muted hover:text-ink"
        }`}
      >
        <IconGlobe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
        <IconChevron className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.nav.language}
          className="absolute right-0 z-50 mt-2 min-w-[9rem] overflow-hidden rounded-xl border border-line bg-ivory p-1 shadow-[0_16px_40px_-16px_rgba(45,33,27,0.4)]"
        >
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => pick(l)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  l === locale ? "bg-surface-warm text-burgundy" : "text-ink hover:bg-surface-warm"
                }`}
              >
                {localeNames[l]}
                <span className="text-xs uppercase text-muted">{l}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
