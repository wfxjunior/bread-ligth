"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

// Swatch = a reading mood expressed only in color + material, no photography.
const PALETTE: { key: string; bg: string; ink: string; ring: string }[] = [
  { key: "parchment", bg: "#F2E7CE", ink: "#5A4A2E", ring: "#D8C79B" },
  { key: "cozy", bg: "#F3E2D2", ink: "#7A4B33", ring: "#E2C6AE" },
  { key: "classic", bg: "#FAF6EC", ink: "#4A3427", ring: "#E4D8C2" },
  { key: "library", bg: "#EAE0D0", ink: "#4A3A28", ring: "#CDBB9E" },
  { key: "morning", bg: "#FDF5E4", ink: "#8A6A2E", ring: "#EBD9B4" },
  { key: "minimal", bg: "#FBFAF7", ink: "#3A3A38", ring: "#E6E2D9" },
  { key: "sepia", bg: "#EFE1CB", ink: "#6B4A2E", ring: "#D8C29A" },
  { key: "serenity", bg: "#14110F", ink: "#C9B48A", ring: "#3A3128" },
  { key: "night", bg: "#12161F", ink: "#9FB2CF", ring: "#2A3242" },
  { key: "focus", bg: "#EDEBE6", ink: "#4A4A46", ring: "#D6D2C8" },
];

export function ReadingAtmospheres() {
  const { t } = useI18n();
  const names = t.atmospheres.names as Record<string, string>;

  return (
    <Section tone="cream">
      <div className="max-w-2xl">
        <Reveal>
          <Eyebrow>{t.atmospheres.eyebrow}</Eyebrow>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
            {t.atmospheres.title}
          </h2>
          <p className="mt-5 font-sans text-lg leading-relaxed text-muted">{t.atmospheres.body}</p>
        </Reveal>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PALETTE.map((s, i) => (
          <Reveal key={s.key} delay={(i % 5) * 60}>
            <div
              className="flex aspect-[4/5] flex-col justify-between rounded-2xl border p-4"
              style={{ background: s.bg, borderColor: s.ring }}
            >
              <span className="font-serif text-2xl" style={{ color: s.ink }} aria-hidden>
                Aa
              </span>
              <span className="font-sans text-xs font-medium" style={{ color: s.ink }}>
                {names[s.key] ?? s.key}
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
