"use client";

import { useI18n } from "@/lib/i18n/context";
import { siteConfig } from "@/lib/config";
import { track } from "@/lib/analytics";
import { ButtonLink } from "@/components/ui/Button";
import { StoreBadges } from "@/components/ui/StoreBadges";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { Screenshot } from "@/components/media/Screenshot";
import { IconArrow } from "@/components/icons";

export function Hero() {
  const { t } = useI18n();
  const ctaHref = siteConfig.launched ? "#download" : "#waitlist";

  return (
    <section id="top" className="bl-grain relative overflow-hidden bg-cream pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* soft ambient warmth, non-decorative-motion */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(80% 55% at 50% -8%, rgba(179,138,63,0.10), transparent 60%), radial-gradient(60% 40% at 92% 8%, rgba(90,31,36,0.06), transparent 55%)",
        }}
      />
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Copy */}
        <div className="max-w-xl">
          {/* Eyebrow pill — desktop only; on mobile it read as boilerplate and
              pushed the headline down. */}
          <p className="mb-5 hidden items-center gap-2 rounded-full border border-line bg-ivory px-3 py-1 font-sans text-xs font-medium text-muted sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            {t.hero.eyebrow}
          </p>
          <h1 className="font-serif text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl">
            {t.hero.title}
          </h1>
          <p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-muted">
            {t.hero.subtitle}
          </p>

          {/* CTAs: full-width equal buttons stacked on mobile, inline on desktop */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink href={ctaHref} size="lg" className="w-full sm:w-auto" onClick={() => track("cta_primary_click", { source: "hero" })}>
              {siteConfig.launched ? t.cta.download : t.cta.waitlist}
            </ButtonLink>
            <ButtonLink href="#experience" size="lg" variant="secondary" className="w-full sm:w-auto">
              {t.cta.explore}
              <IconArrow className="h-4 w-4" />
            </ButtonLink>
          </div>

          <p className="mt-6 font-sans text-sm text-muted">{t.hero.availability}</p>
          <StoreBadges className="mt-4" />
        </div>

        {/* Device composition */}
        <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[330px]">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2.6rem] bg-[radial-gradient(closest-side,rgba(74,52,39,0.14),transparent)]"
          />
          <DeviceFrame>
            <Screenshot src="/screenshots/home-screen.webp" label={t.preview.screens.home} priority />
          </DeviceFrame>
          <div className="mt-4 text-center font-sans text-xs italic text-muted">{t.hero.deviceCaption}</div>
        </div>
      </div>
    </section>
  );
}
