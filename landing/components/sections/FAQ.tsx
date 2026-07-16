"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { Accordion } from "@/components/ui/Accordion";

export function FAQ() {
  const { t } = useI18n();
  return (
    <Section id="faq" tone="ivory">
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <div className="text-center">
            <Eyebrow>{t.faq.eyebrow}</Eyebrow>
            <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
              {t.faq.title}
            </h2>
          </div>
        </Reveal>
        <Reveal delay={80} className="mt-10">
          <Accordion items={t.faq.items} />
        </Reveal>
      </div>
    </Section>
  );
}
