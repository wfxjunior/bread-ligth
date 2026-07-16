"use client";

import { useI18n } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { DeviceFrame } from "@/components/media/DeviceFrame";
import { Screenshot } from "@/components/media/Screenshot";
import { IconCheck } from "@/components/icons";

interface Feature {
  eyebrow: string; title: string; body: string; benefit: string;
  src: string; label: string;
}

function FeatureRow({ f, flip, tone }: { f: Feature; flip: boolean; tone: "cream" | "ivory" }) {
  return (
    <div className={tone === "ivory" ? "bg-ivory" : "bg-cream"}>
      <Container>
        <div className="grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
          <Reveal className={flip ? "lg:order-2" : ""}>
            <Eyebrow>{f.eyebrow}</Eyebrow>
            <h3 className="font-serif text-2xl font-semibold leading-tight text-ink sm:text-4xl">{f.title}</h3>
            <p className="mt-5 max-w-md font-sans text-base leading-relaxed text-muted sm:text-lg">{f.body}</p>
            <p className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-medium text-burgundy">
              <IconCheck className="h-4 w-4 text-gold" />
              {f.benefit}
            </p>
          </Reveal>

          <Reveal delay={100} className={flip ? "lg:order-1" : ""}>
            <div className="mx-auto w-full max-w-[280px]">
              <DeviceFrame>
                <Screenshot src={f.src} label={f.label} />
              </DeviceFrame>
            </div>
          </Reveal>
        </div>
      </Container>
    </div>
  );
}

export function FeatureSections() {
  const { t } = useI18n();
  const f = t.features;
  const rows: Feature[] = [
    { ...f.reading, src: "/screenshots/reader-screen.webp", label: t.preview.screens.reader },
    { ...f.audio, src: "/screenshots/devotional-screen.webp", label: t.preview.screens.devotional },
    { ...f.vocab, src: "/screenshots/vocabulary-screen.webp", label: t.preview.screens.vocabulary },
    { ...f.pronunciation, src: "/screenshots/journey-screen.webp", label: t.preview.screens.journey },
    { ...f.devotional, src: "/screenshots/devotional-screen.webp", label: t.preview.screens.devotional },
  ];

  return (
    <div id="features">
      {rows.map((row, i) => (
        <FeatureRow key={i} f={row} flip={i % 2 === 1} tone={i % 2 === 0 ? "cream" : "ivory"} />
      ))}
    </div>
  );
}
