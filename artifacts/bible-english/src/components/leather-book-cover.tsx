import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Bookmark, type LucideIcon } from 'lucide-react';

// ── Leather category palette ────────────────────────────────────────────────
// Ported from the mobile app's BookshelfLibrary — every biblical category
// owns one leather tone, so the shelf groups volumes by kind (the way a real
// library does) instead of a rainbow of arbitrary card colors.
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
export const GOLD_SOFT = 'rgba(217,181,98,0.45)';
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

// ── Single leather-bound volume ─────────────────────────────────────────────
export function LeatherBookCover({ book }: { book: ShelfBook }) {
  const [pulled, setPulled] = useState(false);
  const leather = CATEGORY_INFO[book.category];
  const isCurrent = book.progress > 0 && book.progress < book.chapters;
  const progressPct = Math.round(Math.min(1, book.progress / book.chapters) * 100);
  const Icon = book.icon;

  return (
    <Link
      href={`/book/${book.id}`}
      onClick={() => setPulled(true)}
      className="shrink-0 block select-none"
      style={{ width: 152 }}
    >
      <motion.div
        initial={false}
        whileHover={{ y: -6, rotate: -1.5 }}
        whileTap={{ scale: 0.96 }}
        animate={pulled ? { y: -40, rotate: -4, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="relative rounded-t-[10px] rounded-b-[4px] overflow-hidden cursor-pointer"
        style={{
          width: 152,
          height: 228,
          boxShadow: isCurrent
            ? `0 10px 24px -6px rgba(0,0,0,0.55), 0 0 0 1px ${GOLD_SOFT}`
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
          style={{ background: `linear-gradient(135deg, ${leather.base}E6, ${leather.deep}F2)` }}
        />
        {/* soft sheen */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 55%)' }}
        />
        {/* overhead shelf light */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(255,224,170,0.22), rgba(255,224,170,0) 38%)' }}
        />

        {/* gold ornamental border */}
        <div
          className="absolute rounded-[5px] pointer-events-none"
          style={{ top: 9, left: 7, right: 7, bottom: 9, border: `1px solid ${GOLD_SOFT}` }}
        />

        {/* era header */}
        <div className="absolute top-4 left-2 right-2 text-center pointer-events-none">
          <p className="text-[8px] font-semibold tracking-widest uppercase" style={{ color: 'rgba(233,214,168,0.6)' }}>
            {book.testament === 'old' ? 'Old Testament' : 'New Testament'}
          </p>
          <p className="text-[7.5px] mt-0.5" style={{ color: 'rgba(233,214,168,0.4)' }}>— {book.era} —</p>
        </div>

        {/* embossed roman numeral watermark + thematic glyph */}
        <div className="absolute inset-x-0 top-[20%] flex items-center justify-center pointer-events-none">
          <div className="absolute rounded-full" style={{ width: 130, height: 130, background: 'rgba(255,255,255,0.05)' }} />
          <div className="absolute rounded-full" style={{ width: 84, height: 84, background: 'rgba(255,255,255,0.05)' }} />
          <span
            className="font-serif font-bold"
            style={{ fontSize: 68, letterSpacing: -2, color: 'rgba(255,244,222,0.16)', textShadow: '0 1.5px 2px rgba(0,0,0,0.45)' }}
          >
            {book.roman}
          </span>
          <Icon
            className="absolute"
            style={{ right: '14%', top: '44%', color: 'rgba(217,181,98,0.26)' }}
            size={30}
            strokeWidth={1.5}
          />
        </div>

        {/* decorative bookmark glyph */}
        <Bookmark className="absolute top-2.5 right-2.5 opacity-65" size={13} style={{ color: GOLD_SOFT }} />

        {/* side tab, colour-matched to the category */}
        <div className="absolute left-0 top-[32%] flex items-center pointer-events-none">
          <div className="w-3 h-6 rounded-r-[2px]" style={{ background: leather.base }} />
          <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: `6px solid ${leather.base}` }} />
        </div>

        {/* right spine edge */}
        <div className="absolute right-0 top-0 bottom-0 w-[5px]" style={{ background: leather.deep }} />
        <div className="absolute top-0 bottom-0 w-px" style={{ right: 5, background: 'rgba(255,255,255,0.10)' }} />

        {/* title block */}
        <div className="absolute left-2.5 right-2.5 bottom-[46px] flex flex-col items-center gap-1.5">
          <p
            className="font-serif font-bold text-center leading-tight"
            style={{ fontSize: 14, color: GOLD, letterSpacing: 0.4, textShadow: '0 1px 1px rgba(0,0,0,0.55)' }}
          >
            {book.name.toUpperCase()}
          </p>
          <div className="w-[18px] h-px" style={{ background: GOLD_SOFT }} />
          <p className="text-center italic" style={{ fontSize: 10, lineHeight: '13px', color: 'rgba(233,214,168,0.65)' }}>
            {book.tagline}
          </p>
        </div>

        {/* progress footer */}
        <div className="absolute left-3 right-3 bottom-3 flex flex-col gap-1.5">
          {isCurrent ? (
            <>
              <div className="relative h-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.14)' }}>
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${progressPct}%`, background: GOLD }} />
                <div
                  className="absolute rounded-full"
                  style={{ top: -2, width: 6, height: 6, left: `${progressPct}%`, marginLeft: -3, background: GOLD }}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[9px] font-medium" style={{ color: 'rgba(233,214,168,0.7)' }}>{book.progress} of {book.chapters}</span>
                <span className="text-[9px] font-medium" style={{ color: 'rgba(233,214,168,0.7)' }}>{progressPct}%</span>
              </div>
            </>
          ) : (
            <p className="text-[9px] text-center tracking-wide" style={{ color: 'rgba(233,214,168,0.4)' }}>
              {book.chapters} chapters
            </p>
          )}
        </div>

        {/* bookmark ribbon — only for the volume currently being studied */}
        {isCurrent && (
          <div
            className="absolute left-[38%] -top-[3px] w-2.5"
            style={{ height: 14 + progressPct * 0.8, background: RIBBON_RED, boxShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            <div
              className="absolute -bottom-[5px] left-0"
              style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderTop: `5px solid ${RIBBON_RED}` }}
            />
            <div
              className="absolute -bottom-[5px] right-0"
              style={{ width: 0, height: 0, borderRight: '5px solid transparent', borderTop: `5px solid ${RIBBON_RED}` }}
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

// ── A single category shelf: label + row of volumes + plank ────────────────
export function BookshelfRow({ category, books }: { category: BookCategory; books: ShelfBook[] }) {
  if (books.length === 0) return null;
  const info = CATEGORY_INFO[category];
  return (
    <div className="mb-2">
      <p
        className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-3 px-1"
        style={{ color: 'rgba(233,214,168,0.55)' }}
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
