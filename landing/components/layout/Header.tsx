"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { siteConfig } from "@/lib/config";
import { track } from "@/lib/analytics";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { ButtonLink } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const nav = [
    { href: "#features", label: t.nav.features },
    { href: "#how", label: t.nav.how },
    { href: "#experience", label: t.nav.experience },
    { href: "#pricing", label: t.nav.pricing },
    { href: "#faq", label: t.nav.faq },
    { href: "/support", label: t.nav.support },
  ];

  const ctaHref = siteConfig.launched ? "#download" : "#waitlist";
  const ctaLabel = siteConfig.launched ? t.cta.download : t.cta.waitlist;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-300 ${
        scrolled
          ? "border-b border-line/70 bg-cream/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#top" className="font-serif text-xl font-semibold tracking-tight text-ink" aria-label="Bread&Light — home">
          Bread<span className="text-gold">&amp;</span>Light
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="font-sans text-sm text-muted transition-colors hover:text-ink"
            >
              {n.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSelector />
          <ButtonLink href={ctaHref} onClick={() => track("cta_primary_click", { source: "header" })}>
            {ctaLabel}
          </ButtonLink>
        </div>

        <div className="lg:hidden">
          <MobileMenu nav={nav} ctaHref={ctaHref} ctaLabel={ctaLabel} />
        </div>
      </div>
    </header>
  );
}
