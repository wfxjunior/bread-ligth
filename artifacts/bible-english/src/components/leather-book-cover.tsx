import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { type LucideIcon } from 'lucide-react';

// ── Leather category palette ────────────────────────────────────────────────
// Every biblical category owns one leather tone, so the shelf groups volumes
// by kind (the way a real library does) instead of a rainbow of arbitrary
// card colors.
export type BookCategory =
  | 'pentateuch' | 'history' | 'poetry' | 'majorProphets' | 'minorProphets'
  | 'gospels' | 'acts' | 'paulineLetters' | 'generalLetters' | 'revelation';

export const CATEGORY_INFO: Record<BookCategory, { base: string; deep: string; label: string }> = {
  pentateuch:     { base: '#6B4A2C', deep: '#33200F', label: 'Pentateuch' },
  history:        { base: '#33513F', deep: '#152219', label: 'History' },
  poetry:         { base: '#6E2438', deep: '#33101A', label: 'Poetry' },
  majorProphets:  { base: '#1E3358', deep: '#0C1830', label: 'Major Prophets' },
  minorProphets:  { base: '#2A4F38', deep: '#12241A', label: 'Minor Prophets' },
  gospels:        { base: '#631E2A', deep: '#2E0D14', label: 'Gospels' },
  acts:           { base: '#5E3D20', deep: '#2C1C0E', label: 'Acts' },
  paulineLetters: { base: '#20395E', deep: '#0E1C30', label: "Paul's Letters" },
  generalLetters: { base: '#4C3159', deep: '#241729', label: 'General Letters' },
  revelation:     { base: '#221D18', deep: '#0A0807', label: 'Revelation' },
};

export const GOLD = '#D9B562';
export const GOLD_SOFT = 'rgba(217,181,98,0.5)';
export const RIBBON_RED = '#7A1626';

export interface ShelfBook {
  id: string;
  name: string;
  category: BookCategory;
  testament: 'old' | 'new';
  roman: string;
  era: string;
  tagline: string;
  chapters: number;
  progress: number;
  icon: LucideIcon;
}

// ── Ornamental corner flourish — a thin gold scroll, one per corner ─────────
function CornerFlourish({ corner }: { corner: 'tl' | 'tr' | 'bl' | 'br' }) {
  const rotate = { tl: 0, tr: 90, bl: -90, br: 180 }[corner];
  const pos =
    corner === 'tl' ? { top: 8, left: 6 } :
    corner === 'tr' ? { top: 8, right: 6 } :
    corner === 'bl' ? { bottom: 8, left: 6 } :
                       { bottom: 8, right: 6 };
  return (
    <svg
      width="20" height="20" viewBox="0 0 20 20"
      className="absolute pointer-events-none"
      style={{ ...pos, transform: `rotate(${rotate}deg)` }}
    >
      <path d="M2 18 Q2 2 18 2" stroke={GOLD} strokeWidth="0.9" fill="none" opacity="0.65" />
      <path d="M2 11 Q2 6 7 6" stroke={GOLD} strokeWidth="0.9" fill="none" opacity="0.5" />
      <circle cx="18" cy="2" r="1.2" fill={GOLD} opacity="0.7" />
      <circle cx="2" cy="18" r="1.2" fill={GOLD} opacity="0.55" />
    </svg>
  );
}

// ── Thin ornamental rule with a small diamond at its center ─────────────────
function OrnamentRule() {
  return (
    <div className="flex items-center gap-1.5 w-full justify-center">
      <div className="h-px flex-1 max-w-[26px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_SOFT})` }} />
      <div className="w-[3px] h-[3px] rotate-45" style={{ background: GOLD, opacity: 0.75 }} />
      <div className="h-px flex-1 max-w-[26px]" style={{ background: `linear-gradient(90deg, ${GOLD_SOFT}, transparent)` }} />
    </div>
  );
}

// ── Single leather-bound volume ─────────────────────────────────────────────
export function LeatherBookCover({ book }: { book: ShelfBook }) {
  const [pulled, setPulled] = useState(false);
  const leather = CATEGORY_INFO[book.category];
  const isCurrent = book.progress > 0 && book.progress < book.chapters;
  const Icon = book.icon;

  return (
    <Link
      href={`/book/${book.id}`}
      onClick={() => setPulled(true)}
      className="shrink-0 block select-none"
      style={{ width: 152, paddingTop: isCurrent ? 14 : 0 }}
    >
      <motion.div
        initial={false}
        whileHover={{ y: (isCurrent ? -10 : 0) - 6, rotate: -1.5 }}
        whileTap={{ scale: 0.96 }}
        animate={pulled ? { y: -40, rotate: -4, opacity: 0 } : { y: isCurrent ? -10 : 0, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative rounded-t-[10px] rounded-b-[4px] overflow-hidden cursor-pointer"
        style={{
          width: 152,
          height: 232,
          boxShadow: isCurrent
            ? `0 18px 30px -10px rgba(0,0,0,0.65), 0 0 0 1px ${GOLD_SOFT}`
            : '0 8px 18px -6px rgba(0,0,0,0.5)',
        }}
      >
        {/* real leather grain, tinted per category */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}textures/leather-texture.jpg)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(160deg, ${leather.base}F0, ${leather.deep}F7 75%)` }}
        />
        {/* soft directional sheen, like an overhead reading lamp */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(120% 70% at 30% 0%, rgba(255,224,170,0.20), rgba(255,224,170,0) 60%)' }}
        />

        {/* gold ornamental border with flourished corners */}
        <div
          className="absolute rounded-[4px] pointer-events-none"
          style={{ top: 10, left: 8, right: 8, bottom: 10, border: `1px solid ${GOLD_SOFT}` }}
        />
        <CornerFlourish corner="tl" />
        <CornerFlourish corner="tr" />
        <CornerFlourish corner="bl" />
        <CornerFlourish corner="br" />

        {/* right spine edge — the bound seam between volumes on the shelf */}
        <div className="absolute right-0 top-0 bottom-0 w-[5px]" style={{ background: leather.deep }} />
        <div className="absolute top-0 bottom-0 w-px" style={{ right: 5, background: 'rgba(255,255,255,0.10)' }} />

        {/* centered text cluster — kicker / title / glyph, generous breathing room */}
        <div className="absolute inset-x-3 top-[24%] flex flex-col items-center gap-2.5">
          <p
            className="text-[9.5px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: 'rgba(233,214,168,0.75)' }}
          >
            {book.testament === 'old' ? 'Old Testament' : 'New Testament'}
          </p>
          <OrnamentRule />
          <p
            className="font-serif font-bold text-center leading-tight"
            style={{ fontSize: 16.5, color: GOLD, letterSpacing: 0.5, textShadow: '0 1px 1.5px rgba(0,0,0,0.55)' }}
          >
            {book.name.toUpperCase()}
          </p>
          <OrnamentRule />
          <Icon size={26} strokeWidth={1.4} style={{ color: 'rgba(217,181,98,0.85)' }} />
        </div>

        {/* bookmark ribbon — only for the volume currently being studied,
            hanging from the top edge to mark it out, no progress bar */}
        {isCurrent && (
          <div
            className="absolute left-[38%] -top-3.5 w-[11px]"
            style={{ height: 26, background: RIBBON_RED, boxShadow: '0 2px 4px rgba(0,0,0,0.35)' }}
          >
            <div
              className="absolute -bottom-[5px] left-0"
              style={{ width: 0, height: 0, borderLeft: '5.5px solid transparent', borderTop: `5.5px solid ${RIBBON_RED}` }}
            />
            <div
              className="absolute -bottom-[5px] right-0"
              style={{ width: 0, height: 0, borderRight: '5.5px solid transparent', borderTop: `5.5px solid ${RIBBON_RED}` }}
            />
          </div>
        )}
      </motion.div>
    </Link>
  );
}

// ── Shelf plank beneath a row of books ──────────────────────────────────────
function ShelfPlank() {
  return (
    <div className="relative -mt-0.5">
      <div className="h-4 -mb-1.5" style={{ background: 'linear-gradient(180deg, rgba(255,196,120,0.10), rgba(255,196,120,0))' }} />
      <div className="h-2.5" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.32), rgba(0,0,0,0))' }} />
      <div
        className="h-[15px] rounded-[2px] relative overflow-hidden"
        style={{ background: 'linear-gradient(90deg, #4A2F1B, #2A1A0E 70%)' }}
      >
        <div className="absolute top-[2px] left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.10)' }} />
        <div className="absolute bottom-[3px] left-0 right-0 h-px" style={{ background: 'rgba(0,0,0,0.25)' }} />
      </div>
    </div>
  );
}

// ── A single category shelf: warm backlight + label + row of volumes + plank
export function BookshelfRow({ category, books }: { category: BookCategory; books: ShelfBook[] }) {
  if (books.length === 0) return null;
  const info = CATEGORY_INFO[category];
  return (
    <div className="mb-3">
      {/* hidden warm light strip washing down over the shelf, like the
          backlit niche lighting behind a premium bookcase */}
      <div
        className="h-6 -mb-4 rounded-full mx-6"
        style={{ background: 'radial-gradient(50% 100% at 50% 0%, rgba(255,196,120,0.22), rgba(255,196,120,0) 75%)' }}
      />
      <p
        className="relative text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 px-1"
        style={{ color: 'rgba(233,214,168,0.6)' }}
      >
        {info.label}
      </p>
      <div className="flex items-end gap-4 flex-wrap px-1 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
        {books.map(book => <LeatherBookCover key={book.id} book={book} />)}
      </div>
      <ShelfPlank />
    </div>
  );
}

// ── Full wooden cabinet — the premium bookshelf backdrop ────────────────────
export function BookshelfCabinet({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(115deg, #2A1A0F, #150C07 70%)' }}>
      {/* procedural wood-grain streaks — vertical oak paneling behind the shelf */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 1px, transparent 1px, transparent 46px), ' +
            'repeating-linear-gradient(90deg, rgba(255,180,110,0.05) 0px, rgba(255,180,110,0.05) 2px, transparent 2px, transparent 92px)',
        }}
      />
      {/* warm overhead light */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: '40%', background: 'linear-gradient(180deg, rgba(255,214,158,0.20), rgba(255,205,140,0))' }}
      />
      {/* edge vignettes */}
      <div className="absolute inset-y-0 left-0 w-10 pointer-events-none" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.4), rgba(0,0,0,0))' }} />
      <div className="absolute inset-y-0 right-0 w-10 pointer-events-none" style={{ background: 'linear-gradient(270deg, rgba(0,0,0,0.4), rgba(0,0,0,0))' }} />
      <div className="relative p-6 md:p-8">{children}</div>
    </div>
  );
}
