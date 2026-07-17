"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { LibraryShelf } from "@/components/media/LibraryShelf";

export function BibleLibrary() {
  const { t } = useI18n();
  return (
    <Section tone="dark" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-0"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(179,138,63,0.12), transparent 60%)" }}
      />
      <div className="relative grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <Eyebrow onDark>{t.library.eyebrow}</Eyebrow>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-onDark sm:text-[2.75rem]">
            {t.library.title}
          </h2>
          <p className="mt-6 max-w-md font-sans text-lg leading-relaxed text-onDarkMuted">
            {t.library.body}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <LibraryShelf caption={t.library.caption} />
        </Reveal>
      </div>
    </Section>
  );
}
