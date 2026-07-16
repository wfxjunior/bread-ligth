"use client";

import { useI18n } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/config";
import { IconArrow, IconInstagram, IconYouTube } from "@/components/icons";

export default function ContactPage() {
  const { t } = useI18n();
  const c = t.legal.contact;
  return (
    <div className="bg-cream pt-28 pb-24">
      <Container className="max-w-3xl">
        <a href="/" className="inline-flex items-center gap-2 font-sans text-sm text-muted transition-colors hover:text-burgundy">
          <IconArrow className="h-4 w-4 rotate-180" />
          {c.back}
        </a>
        <h1 className="mt-8 font-serif text-4xl font-semibold text-ink sm:text-5xl">{c.title}</h1>
        <p className="mt-6 font-sans text-lg leading-relaxed text-muted">{c.intro}</p>

        <div className="mt-10 space-y-6">
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">{c.emailLabel}</h2>
            <a href={`mailto:${siteConfig.contactEmail}`} className="mt-2 inline-block font-serif text-2xl text-burgundy hover:underline">
              {siteConfig.contactEmail}
            </a>
          </div>
          <div>
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.14em] text-muted">{c.socialLabel}</h2>
            <div className="mt-3 flex items-center gap-3">
              <a href={siteConfig.instagramUrl} aria-label={t.footer.instagram} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-burgundy hover:text-burgundy">
                <IconInstagram className="h-5 w-5" />
              </a>
              <a href={siteConfig.youtubeUrl} aria-label={t.footer.youtube} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-burgundy hover:text-burgundy">
                <IconYouTube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
