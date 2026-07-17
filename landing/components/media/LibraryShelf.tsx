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
const BOOKS: { name: string; leather: string; h: number; w: number }[] = [
  { name: "Genesis", leather: "#6B4A32", h: 176, w: 34 },
  { name: "Exodus", leather: "#4A3427", h: 168, w: 28 },
  { name: "Psalms", leather: "#5A1F24", h: 188, w: 38 },
  { name: "Proverbs", leather: "#7A4B28", h: 160, w: 26 },
  { name: "Isaiah", leather: "#3C4A3A", h: 182, w: 32 },
  { name: "Matthew", leather: "#5A1F24", h: 172, w: 30 },
  { name: "John", leather: "#6B4A32", h: 190, w: 36 },
  { name: "Acts", leather: "#4A3427", h: 164, w: 28 },
  { name: "Romans", leather: "#3A3550", h: 178, w: 32 },
  { name: "Hebrews", leather: "#6B4A32", h: 158, w: 26 },
  { name: "James", leather: "#7A4B28", h: 170, w: 24 },
  { name: "Revelation", leather: "#5A1F24", h: 186, w: 34 },
];

function Spine({ name, leather, h, w }: (typeof BOOKS)[number]) {
  return (
    <div
      className="group/spine relative flex shrink-0 items-center justify-center rounded-t-[3px] rounded-b-[2px] transition-transform duration-300 ease-[var(--ease-out-soft)] hover:-translate-y-2"
      style={{
        width: w,
        height: h,
        // Leather body with cylindrical light: dark edges → lit centre → dark edge.
        background: `linear-gradient(90deg,
          rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.12) 10%,
          rgba(255,255,255,0.10) 42%, rgba(255,255,255,0.06) 55%,
          rgba(0,0,0,0.16) 88%, rgba(0,0,0,0.40) 100%), ${leather}`,
        boxShadow:
          "0 14px 22px -10px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 3px rgba(0,0,0,0.4)",
      }}
    >
      {/* Raised hubs — the horizontal ridges of an antique leather spine */}
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-[16%] h-[3px] bg-black/25 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
      <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-[18%] h-[3px] bg-black/25 shadow-[0_1px_0_rgba(255,255,255,0.08)]" />
      {/* Gold-foil title, embossed */}
      <span
        className="whitespace-nowrap font-serif text-[11px] tracking-wide"
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
