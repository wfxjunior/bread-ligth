/**
 * Shared daily-verse utilities.
 *
 * Uses a DST-safe day index: instead of dividing elapsed milliseconds by
 * 86 400 000, we compare midnight-anchored Date objects constructed from
 * local date parts, which avoids the ±1h drift that DST can introduce.
 */

import { BIBLE_DATA } from '@/constants/bibleData';

export interface DailyEntry {
  bookId:  string;
  chapter: number;
  verse:   number;
  bookEn:  string;
  bookPt:  string;
}

export const DAILY_POOL: DailyEntry[] = [
  { bookId: 'genesis',      chapter: 1,  verse: 1,  bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'genesis',      chapter: 1,  verse: 3,  bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'genesis',      chapter: 1,  verse: 26, bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 23, verse: 1,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'psalms',       chapter: 23, verse: 4,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'psalms',       chapter: 23, verse: 6,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'matthew',      chapter: 5,  verse: 3,  bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'matthew',      chapter: 5,  verse: 6,  bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'matthew',      chapter: 5,  verse: 8,  bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john1',        chapter: 1,  verse: 1,  bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'john1',        chapter: 1,  verse: 14, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'john1',        chapter: 1,  verse: 16, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'john',         chapter: 3,  verse: 16, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'john',         chapter: 3,  verse: 17, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 8,  verse: 28, bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'romans',       chapter: 8,  verse: 38, bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 4,  verse: 6,  bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: 'philippians',  chapter: 4,  verse: 13, bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 13, verse: 4,  bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
  { bookId: '1corinthians', chapter: 13, verse: 13, bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
];

/** DST-safe ordinal day of year (1 = Jan 1). Uses Math.round to absorb the
 *  1-hour drift that occurs on daylight-saving transitions. */
export function dayOfYear(date: Date): number {
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const todayMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((todayMidnight.getTime() - jan1.getTime()) / 86_400_000) + 1;
}

/** "YYYY-MM-DD" key for today's completion AsyncStorage entry. */
export function todayKey(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `@bibliaeN:daily:${d.getFullYear()}-${m}-${day}`;
}

/** Returns the DailyEntry for a given date. */
export function getEntryForDate(date: Date): DailyEntry {
  const idx = dayOfYear(date) % DAILY_POOL.length;
  return DAILY_POOL[idx];
}

/** Resolves the BibleVerse object for a DailyEntry, or null if data is missing. */
export function resolveVerse(entry: DailyEntry) {
  const book    = BIBLE_DATA[entry.bookId];
  const chapter = book?.chapters[entry.chapter];
  return chapter?.find(v => v.v === entry.verse) ?? null;
}
