"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import {
  IconRead, IconListen, IconLearn, IconSpeak, IconReflect, IconGrow,
} from "@/components/icons";

export function CoreExperience() {
  const { t } = useI18n();
  const items = [
    { key: "read", Icon: IconRead, ...t.core.items.read },
    { key: "listen", Icon: IconListen, ...t.core.items.listen },
    { key: "learn", Icon: IconLearn, ...t.core.items.learn },
    { key: "speak", Icon: IconSpeak, ...t.core.items.speak },
    { key: "reflect", Icon: IconReflect, ...t.core.items.reflect },
    { key: "grow", Icon: IconGrow, ...t.core.items.grow },
  ];

  return (
    <Section id="experience" tone="cream">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>{t.core.eyebrow}</Eyebrow>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
            {t.core.title}
          </h2>
          <p className="mt-5 font-sans text-lg leading-relaxed text-muted">{t.core.subtitle}</p>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ key, Icon, title, body }, i) => (
          <Reveal key={key} delay={(i % 3) * 80} className="bg-ivory">
            <div className="flex h-full flex-col gap-3 p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-surface-warm text-burgundy">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="font-serif text-xl text-ink">{title}</h3>
              <p className="font-sans text-[0.95rem] leading-relaxed text-muted">{body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
