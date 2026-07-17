"use client";

import Image from "next/image";
import { useState } from "react";

// ── The Scripture shelf — Bread&Light's signature visual ─────────────────────
// Renders public/library/breadlight-library.webp when present (a real walnut-
// shelf render), otherwise a handcrafted CSS shelf at the SAME proportions, so
// dropping the asset in later needs no code change. Art direction: antique
// walnut, leather spines with raised hubs, gold-foil titles, warm top light.

const REAL_SRC = "/library/breadlight-library.webp";

// Leather-bound "books" — canonical order, varied like a real collection.
// height/width in px at the base scale; the shelf container scales fluidly.
// Only the book name appears on each spine — never verses, chapter
// references or decorative quotations. `mobileHidden` trims the collection
// on narrow screens so spacing stays even without shrinking the books.
const BOOKS: { name: string; leather: string; h: number; w: number; mobileHidden?: boolean }[] = [
  { name: "Genesis", leather: "#6B4A32", h: 176, w: 34 },
  { name: "Exodus", leather: "#4A3427", h: 168, w: 28 },
  { name: "Psalms", leather: "#5A1F24", h: 188, w: 38 },
  { name: "Proverbs", leather: "#7A4B28", h: 160, w: 26, mobileHidden: true },
  { name: "Isaiah", leather: "#3C4A3A", h: 182, w: 32 },
  { name: "Matthew", leather: "#5A1F24", h: 172, w: 30 },
  { name: "John", leather: "#6B4A32", h: 190, w: 36 },
  { name: "Acts", leather: "#4A3427", h: 164, w: 28, mobileHidden: true },
  { name: "Romans", leather: "#3A3550", h: 178, w: 32 },
  { name: "Hebrews", leather: "#6B4A32", h: 158, w: 26, mobileHidden: true },
  { name: "James", leather: "#7A4B28", h: 170, w: 24, mobileHidden: true },
  { name: "Revelation", leather: "#5A1F24", h: 186, w: 34 },
];

// Fine leather grain — a tiny SVG turbulence tile, overlaid at low opacity so
// each spine reads as material rather than flat color. Inline data URI keeps
// the component dependency-free and cache-friendly.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='64' height='64' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

function Spine({ name, leather, h, w, mobileHidden }: (typeof BOOKS)[number]) {
  return (
    <div
      className={`group/spine relative shrink-0 items-center justify-center overflow-hidden rounded-t-[5px] rounded-b-[3px] transition-transform duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-2 ${mobileHidden ? "hidden sm:flex" : "flex"}`}
      style={{
        width: w,
        height: h,
        // Rounded leather spine: dark edges → lit centre → dark edge, with a
        // gentle top sheen where shelf light falls.
        background: `linear-gradient(180deg, rgba(255,255,255,0.08), transparent 12%),
          linear-gradient(90deg,
          rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.14) 12%,
          rgba(255,255,255,0.11) 40%, rgba(255,255,255,0.05) 58%,
          rgba(0,0,0,0.18) 86%, rgba(0,0,0,0.44) 100%), ${leather}`,
        boxShadow:
          "0 14px 22px -10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 3px rgba(0,0,0,0.4)",
      }}
    >
      {/* Leather grain texture */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: GRAIN, opacity: 0.35 }}
      />
      {/* Raised hubs — the horizontal ridges of an antique leather spine */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-[14%] h-[3px] bg-black/25 shadow-[0_1px_0_rgba(255,255,255,0.10)]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[16%] h-[3px] bg-black/25 shadow-[0_1px_0_rgba(255,255,255,0.10)]" />
      {/* Gold-foil title — book name only, centered on one shared axis.
          The hubs sit at 14%/16%, leaving an identical title field on every
          spine regardless of its height, so all names align visually. */}
      <span
        className="whitespace-nowrap text-center font-serif text-[11px] leading-none tracking-[0.06em]"
        style={{
          writingMode: "vertical-rl",
          color: "#E4C077",
          textShadow: "0 1px 1px rgba(0,0,0,0.55), 0 0 1px rgba(228,192,119,0.4)",
        }}
      >
        {name}
      </span>
    </div>
  );
}

export function LibraryShelf({ caption }: { caption: string }) {
  const [failed, setFailed] = useState(false);
  const showReal = !failed;

  return (
    <div className="relative">
      {/* Real render (auto-used when the file exists) */}
      {showReal && (
        <div className="relative aspect-[5/3] w-full overflow-hidden rounded-2xl">
          <Image
            src={REAL_SRC}
            alt={caption}
            fill
            sizes="(max-width: 1024px) 90vw, 560px"
            className="object-cover"
            onError={() => setFailed(true)}
          />
        </div>
      )}

      {/* Handcrafted CSS shelf (fallback + current default) */}
      {!showReal && (
        <div
          className="bl-grain relative overflow-hidden rounded-2xl border border-white/10 p-6 pb-5 sm:p-8 sm:pb-6"
          style={{
            background:
              "radial-gradient(120% 80% at 50% -10%, rgba(179,138,63,0.16), transparent 55%), linear-gradient(#251913, #1c120d)",
          }}
          role="img"
          aria-label={caption}
        >
          {/* Warm integrated top light */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{ background: "radial-gradient(70% 100% at 50% 0%, rgba(228,192,119,0.18), transparent 70%)" }}
          />

          {/* Books, resting on the shelf */}
          <div className="relative z-10 flex items-end justify-center gap-[5px] sm:gap-2">
            {BOOKS.map((b) => (
              <Spine key={b.name} {...b} />
            ))}
          </div>

          {/* Walnut shelf plank with front edge + contact shadow */}
          <div className="relative z-0 mt-[-2px]">
            <div
              className="h-4 rounded-[2px]"
              style={{
                background:
                  "linear-gradient(180deg, #4a3221 0%, #3a2517 55%, #2c1c12 100%)",
                boxShadow:
                  "0 -8px 16px -8px rgba(0,0,0,0.7), inset 0 1px 0 rgba(228,192,119,0.14)",
              }}
            />
            {/* plank front edge (depth) */}
            <div
              className="h-2 rounded-b-[3px]"
              style={{ background: "linear-gradient(180deg, #241610, #1a0f0a)" }}
            />
          </div>

          <p className="relative z-10 mt-5 text-center font-sans text-xs italic text-onDarkMuted">{caption}</p>
        </div>
      )}
    </div>
  );
}
