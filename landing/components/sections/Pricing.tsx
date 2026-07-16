"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { siteConfig } from "@/lib/config";
import { track } from "@/lib/analytics";
import { Section } from "@/components/ui/Section";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { IconCheck } from "@/components/icons";

export function Pricing() {
  const { t } = useI18n();
  const [yearly, setYearly] = useState(true);
  const { pricing } = siteConfig;
  const price = yearly ? pricing.yearly : pricing.monthly;
  const period = yearly ? t.pricing.perYear : t.pricing.perMonth;
  const ctaHref = siteConfig.launched ? "#download" : "#waitlist";

  const toggle = (next: boolean) => {
    setYearly(next);
    track("pricing_toggle", { yearly: next });
  };

  return (
    <Section id="pricing" tone="cream">
      <div className="mx-auto max-w-xl text-center">
        <Reveal>
          <Eyebrow>{t.pricing.eyebrow}</Eyebrow>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-ink sm:text-[2.75rem]">
            {t.pricing.title}
          </h2>
          <p className="mt-4 font-sans text-lg text-muted">{t.pricing.subtitle}</p>
        </Reveal>
      </div>

      {/* Billing toggle */}
      <Reveal delay={80} className="mt-9">
        <div
          className="mx-auto flex w-fit items-center gap-1 rounded-full border border-line bg-ivory p-1"
          role="tablist"
          aria-label={t.pricing.title}
        >
          {[
            { label: t.pricing.monthly, val: false },
            { label: t.pricing.yearly, val: true },
          ].map((o) => (
            <button
              key={String(o.val)}
              role="tab"
              aria-selected={yearly === o.val}
              onClick={() => toggle(o.val)}
              className={`h-9 rounded-full px-5 font-sans text-sm font-medium transition-colors ${
                yearly === o.val ? "bg-burgundy text-[#F7F2E8]" : "text-muted hover:text-ink"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Card */}
      <Reveal delay={140} className="mt-10">
        <div className="mx-auto max-w-md overflow-hidden rounded-3xl border border-line bg-ivory shadow-[0_24px_60px_-30px_rgba(45,33,27,0.4)]">
          <div className="relative border-b border-line p-8 text-center">
            {yearly && (
              <span className="absolute right-5 top-5 rounded-full bg-gold/15 px-3 py-1 font-sans text-xs font-semibold text-gold">
                {t.pricing.save.replace("{pct}", String(pricing.yearlySavingsPct))}
              </span>
            )}
            <h3 className="font-serif text-2xl text-ink">{t.pricing.planName}</h3>
            <div className="mt-5 flex items-end justify-center gap-1">
              <span className="font-serif text-5xl font-semibold text-ink">
                {pricing.currency} {price.toFixed(2)}
              </span>
              <span className="mb-1.5 font-sans text-base text-muted">{period}</span>
            </div>
            {yearly && (
              <p className="mt-2 font-sans text-sm text-muted">{t.pricing.billedYearly}</p>
            )}
          </div>

          <div className="p-8">
            <ul className="space-y-3">
              {t.pricing.features.map((f) => (
                <li key={f} className="flex items-start gap-3 font-sans text-[0.95rem] text-ink">
                  <IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3">
              <ButtonLink
                href={ctaHref}
                size="lg"
                className="w-full"
                onClick={() => track("cta_primary_click", { source: "pricing" })}
              >
                {siteConfig.launched ? t.cta.download : t.cta.waitlist}
              </ButtonLink>
              <ButtonLink href={ctaHref} variant="ghost" className="w-full">
                {t.pricing.free}
              </ButtonLink>
            </div>

            <p className="mt-6 text-center font-sans text-xs leading-relaxed text-muted">
              {t.pricing.mission}
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
