"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

export function HowItWorks() {
  const { t } = useI18n();
  const steps = [t.how.steps.one, t.how.steps.two, t.how.steps.three];

  return (
    <Section id="how" tone="ivory">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>{t.how.eyebrow}</Eyebrow>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
            {t.how.title}
          </h2>
        </Reveal>
      </div>

      <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6">
        {steps.map((s, i) => (
          <Reveal as="li" key={i} delay={i * 100} className="relative">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 font-serif text-lg text-burgundy">
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <span aria-hidden className="hidden h-px flex-1 bg-line sm:block" />
              )}
            </div>
            <h3 className="mt-5 font-serif text-xl text-ink">{s.title}</h3>
            <p className="mt-2 max-w-xs font-sans text-[0.95rem] leading-relaxed text-muted">{s.body}</p>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
