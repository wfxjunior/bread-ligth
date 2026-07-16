export function Eyebrow({ children, onDark = false }: { children: React.ReactNode; onDark?: boolean }) {
  return (
    <p
      className={`mb-4 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.18em] ${
        onDark ? "text-gold" : "text-gold-ink"
      }`}
    >
      {children}
    </p>
  );
}
