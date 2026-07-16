"use client";

import { useI18n } from "@/lib/i18n/context";
import { siteConfig } from "@/lib/config";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { IconInstagram, IconYouTube } from "@/components/icons";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const groups = [
    {
      title: t.footer.product,
      links: [
        { href: "/#features", label: t.footer.features },
        { href: "/#pricing", label: t.footer.pricing },
        { href: "/#faq", label: t.footer.faq },
      ],
    },
    {
      title: t.footer.legal,
      links: [
        { href: "/privacy", label: t.footer.privacy },
        { href: "/terms", label: t.footer.terms },
        { href: "/support", label: t.footer.support },
        { href: "/contact", label: t.footer.contact },
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-ivory">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <span className="font-serif text-2xl font-semibold text-ink">
              Bread<span className="text-gold">&amp;</span>Light
            </span>
            <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-muted">
              {t.footer.mission}
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={siteConfig.instagramUrl}
                aria-label={t.footer.instagram}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-burgundy hover:text-burgundy"
              >
                <IconInstagram className="h-5 w-5" />
              </a>
              <a
                href={siteConfig.youtubeUrl}
                aria-label={t.footer.youtube}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-burgundy hover:text-burgundy"
              >
                <IconYouTube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {groups.map((g) => (
            <nav key={g.title} aria-label={g.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {g.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="font-sans text-sm text-ink transition-colors hover:text-burgundy">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
          <p className="font-sans text-xs text-muted">
            © {year} Bread&amp;Light. {t.footer.rights}
          </p>
          <div className="flex items-center gap-4">
            <span className="font-sans text-xs italic text-gold">{t.footer.freeForever}</span>
            <LanguageSelector />
          </div>
        </div>
      </div>
    </footer>
  );
}
