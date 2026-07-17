"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "@/lib/i18n/context";
import { track } from "@/lib/analytics";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ButtonLink } from "@/components/ui/Button";
import { IconMenu, IconClose } from "@/components/icons";

export function MobileMenu({
  nav,
  ctaHref,
  ctaLabel,
}: {
  nav: { href: string; label: string }[];
  ctaHref: string;
  ctaLabel: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  // Lock scroll + close on Escape while the sheet is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.nav.menu}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-warm"
      >
        <IconMenu className="h-6 w-6" />
      </button>

      {/* Portaled to <body>: the header's backdrop-blur creates a CSS
          containing block that would otherwise trap this fixed overlay inside
          the 64px bar — the sheet showed clipped, overlapping and blurred. */}
      {open && createPortal(
        <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <button
            type="button"
            aria-label={t.nav.close}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-surface-dark/40 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-cream p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="font-serif text-xl font-semibold text-ink">
                Bread<span className="text-gold">&amp;</span>Light
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t.nav.close}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-warm"
              >
                <IconClose className="h-6 w-6" />
              </button>
            </div>

            <nav aria-label="Mobile" className="mt-8 flex flex-col">
              {nav.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-line/70 py-4 font-serif text-2xl text-ink transition-colors hover:text-burgundy"
                >
                  {n.label}
                </a>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-4 pt-8">
              <LanguageSelector />
              <ButtonLink
                href={ctaHref}
                size="lg"
                onClick={() => {
                  track("cta_primary_click", { source: "mobile_menu" });
                  setOpen(false);
                }}
                className="w-full"
              >
                {ctaLabel}
              </ButtonLink>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
