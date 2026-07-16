import type { ReactNode } from "react";
import { Container } from "./Container";

type Tone = "cream" | "ivory" | "warm" | "dark" | "leather";
const toneClass: Record<Tone, string> = {
  cream: "bg-cream text-ink",
  ivory: "bg-ivory text-ink",
  warm: "bg-surface-warm text-ink",
  dark: "bg-surface-dark text-onDark",
  leather: "bg-leather text-onDark",
};

export function Section({
  id,
  tone = "cream",
  children,
  className = "",
  containerClassName = "",
}: {
  id?: string;
  tone?: Tone;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
}) {
  return (
    <section id={id} className={`scroll-mt-24 py-20 sm:py-28 ${toneClass[tone]} ${className}`}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
