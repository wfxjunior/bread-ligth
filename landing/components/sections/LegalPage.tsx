"use client";

import { useI18n } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { IconArrow } from "@/components/icons";

export function LegalPage({
  which,
}: {
  which: "privacy" | "terms" | "support";
}) {
  const { t } = useI18n();
  const data = t.legal[which];
  const updated = "updated" in data ? (data as { updated?: string }).updated : undefined;

  return (
    <div className="bg-cream pt-28 pb-24">
      <Container className="max-w-3xl">
        <a href="/" className="inline-flex items-center gap-2 font-sans text-sm text-muted transition-colors hover:text-burgundy">
          <IconArrow className="h-4 w-4 rotate-180" />
          {t.legal.backHome}
        </a>
        <h1 className="mt-8 font-serif text-4xl font-semibold text-ink sm:text-5xl">{data.title}</h1>
        {updated && <p className="mt-2 font-sans text-sm text-muted">{updated}</p>}
        <p className="mt-6 font-sans text-lg leading-relaxed text-muted">{data.intro}</p>

        <div className="mt-10 space-y-8">
          {data.sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-serif text-2xl text-ink">{s.h}</h2>
              <p className="mt-3 font-sans text-base leading-relaxed text-muted">{s.p}</p>
            </section>
          ))}
        </div>
      </Container>
    </div>
  );
}
