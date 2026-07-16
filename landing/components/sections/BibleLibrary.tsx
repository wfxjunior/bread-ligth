"use client";

import { useI18n } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

// A tasteful, code-drawn bookshelf — leather spines with gold-foil titles.
// No external art required; replace with real artwork later if desired.
const SPINES = [
  { name: "Genesis", tone: "#6B4A32" },
  { name: "Psalms", tone: "#5A1F24" },
  { name: "Proverbs", tone: "#4A3427" },
  { name: "Isaiah", tone: "#3C4A3A" },
  { name: "Matthew", tone: "#5A1F24" },
  { name: "John", tone: "#6B4A32" },
  { name: "Romans", tone: "#4A3427" },
  { name: "Psalms II", tone: "#3A3550" },
];

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
          <div className="rounded-2xl border border-white/10 bg-[#241812] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-end justify-center gap-2 sm:gap-2.5" role="img" aria-label={t.library.caption}>
              {SPINES.map((s, i) => (
                <div
                  key={s.name}
                  className="relative flex items-center justify-center rounded-[3px] shadow-[0_10px_20px_-8px_rgba(0,0,0,0.6)]"
                  style={{
                    background: `linear-gradient(90deg, rgba(0,0,0,0.28), transparent 22%, transparent 78%, rgba(0,0,0,0.28)), ${s.tone}`,
                    width: 34,
                    height: 150 + ((i * 13) % 34),
                  }}
                >
                  <span
                    className="whitespace-nowrap font-serif text-[11px] tracking-wide"
                    style={{ writingMode: "vertical-rl", color: "#DBB871" }}
                  >
                    {s.name}
                  </span>
                </div>
              ))}
            </div>
            {/* shelf plank */}
            <div className="mt-3 h-3 rounded-[2px] bg-[linear-gradient(#3a2a20,#2b1f18)] shadow-[0_6px_14px_-6px_rgba(0,0,0,0.7)]" />
            <p className="mt-4 text-center font-sans text-xs italic text-onDarkMuted">{t.library.caption}</p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
