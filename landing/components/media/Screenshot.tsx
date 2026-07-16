"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Renders a real screenshot from /public/screenshots when present, otherwise a
 * polished branded placeholder at the correct phone aspect ratio (never a
 * broken image). Drop the matching .webp into /public/screenshots to replace.
 * See public/screenshots/README.md.
 */
export function Screenshot({
  src,
  label,
  className = "",
  priority = false,
}: {
  src: string;
  label: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={`relative aspect-[9/19.5] w-full overflow-hidden rounded-[1.6rem] bg-surface-warm ${className}`}
    >
      {!failed ? (
        <Image
          src={src}
          alt={label}
          fill
          sizes="(max-width: 768px) 60vw, 300px"
          className="object-cover"
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <Placeholder label={label} />
      )}
    </div>
  );
}

function Placeholder({ label }: { label: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(160deg,#F1EADF,#E7DECD)] p-6 text-center"
      role="img"
      aria-label={`${label} — preview placeholder`}
    >
      <span className="font-serif text-lg text-leather/80">Bread&amp;Light</span>
      <span className="h-px w-8 bg-gold/50" />
      <span className="font-sans text-xs font-medium uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      <span className="mt-1 font-sans text-[0.68rem] text-muted/70">Screenshot placeholder</span>
    </div>
  );
}
