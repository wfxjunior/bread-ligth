"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { Screenshot } from "@/components/media/Screenshot";
import { track } from "@/lib/analytics";

export function AppPreview() {
  const { t } = useI18n();
  const s = t.preview.screens;
  const shots = [
    { src: "/screenshots/home-screen.webp", label: s.home },
    { src: "/screenshots/library-screen.webp", label: s.library },
    { src: "/screenshots/reader-screen.webp", label: s.reader },
    { src: "/screenshots/devotional-screen.webp", label: s.devotional },
    { src: "/screenshots/vocabulary-screen.webp", label: s.vocabulary },
    { src: "/screenshots/journey-screen.webp", label: s.journey },
  ];

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

      {/* Horizontal snap scroll — user-controlled, no autoplay. Edge masks hint
          that there is more to scroll without adding chrome. */}
      <div
        className="relative mt-12 [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]"
      >
      <div
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-6 [scrollbar-width:thin]"
        onScroll={() => track("carousel_interact")}
        role="group"
        aria-label={t.preview.title}
      >
        {shots.map((shot, i) => (
          <figure key={i} className="w-[220px] shrink-0 snap-center sm:w-[240px]">
            <DeviceFrame>
              <Screenshot src={shot.src} label={shot.label} />
            </DeviceFrame>
            <figcaption className="mt-3 text-center font-sans text-sm text-muted">{shot.label}</figcaption>
          </figure>
        ))}
      </div>
      </div>
    </Section>
  );
}
