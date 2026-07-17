"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

export function ProductStory() {
  const { t } = useI18n();
  return (
    <Section tone="ivory">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <Eyebrow>{t.story.eyebrow}</Eyebrow>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
            {t.story.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-sans text-lg leading-relaxed text-muted">
            {t.story.body}
          </p>
        </Reveal>
        <Reveal delay={120}>
          <div className="mx-auto mt-10 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-5 text-left shadow-[var(--shadow-xs)]">
              <p className="font-serif text-xl text-burgundy">{t.story.bread}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5 text-left shadow-[var(--shadow-xs)]">
              <p className="font-serif text-xl text-burgundy">{t.story.light}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
