"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { Screenshot } from "@/components/media/Screenshot";

/**
 * A Look Inside — one staged trio instead of a six-phone carousel.
 * The Home screen leads center stage with Reader and Library angled softly
 * behind it (Apple product-page language). The remaining screens each appear
 * individually inside the feature sections, so nothing is lost and the page
 * never reads as a wall of screenshots.
 */
export function AppPreview() {
  const { t } = useI18n();
  const s = t.preview.screens;

  return (
    <Section tone="cream" containerClassName="overflow-visible">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>{t.preview.eyebrow}</Eyebrow>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
            {t.preview.title}
          </h2>
          <p className="mt-5 font-sans text-lg leading-relaxed text-muted">{t.preview.subtitle}</p>
        </Reveal>
      </div>

      <Reveal delay={120}>
        <div className="relative mx-auto mt-14 flex max-w-3xl items-end justify-center">
          {/* soft stage light behind the trio */}
          <div
            aria-hidden
            className="absolute inset-x-8 bottom-0 top-8 -z-10 rounded-[50%] bg-[radial-gradient(closest-side,rgba(74,52,39,0.16),transparent_75%)]"
          />

          {/* Reader — left wing (desktop/tablet only) */}
          <figure className="relative z-0 hidden w-[190px] shrink-0 -rotate-[5deg] translate-y-7 -mr-8 md:block">
            <DeviceFrame>
              <Screenshot src="/screenshots/reader-screen.webp" label={s.reader} />
            </DeviceFrame>
          </figure>

          {/* Home — center stage */}
          <figure className="relative z-10 w-[250px] shrink-0 sm:w-[270px]">
            <DeviceFrame>
              <Screenshot src="/screenshots/home-screen.webp" label={s.home} />
            </DeviceFrame>
          </figure>

          {/* Library — right wing (desktop/tablet only) */}
          <figure className="relative z-0 hidden w-[190px] shrink-0 rotate-[5deg] translate-y-7 -ml-8 md:block">
            <DeviceFrame>
              <Screenshot src="/screenshots/library-screen.webp" label={s.library} />
            </DeviceFrame>
          </figure>
        </div>

        <p className="mt-8 text-center font-sans text-sm text-muted">
          <span className="hidden md:inline">{s.reader} · {s.home} · {s.library}</span>
          <span className="md:hidden">{s.home}</span>
        </p>
      </Reveal>
    </Section>
  );
}
