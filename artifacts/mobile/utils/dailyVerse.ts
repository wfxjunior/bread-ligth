/**
 * Shared daily-verse utilities.
 *
 * Uses a DST-safe day index: instead of dividing elapsed milliseconds by
 * 86 400 000, we compare midnight-anchored Date objects constructed from
 * local date parts, which avoids the ±1h drift that DST can introduce.
 *
 * Pool is arranged in round-robin across all 8 available books so each
 * consecutive group of 8 days visits every book exactly once.
 */

import { BIBLE_DATA } from '@/constants/bibleData';

export interface DailyEntry {
  bookId:  string;
  chapter: number;
  verse:   number;
  bookEn:  string;
  bookPt:  string;
}

// 64 entries — 8 books × 8 verses, interleaved so the book changes every day
export const DAILY_POOL: DailyEntry[] = [
  // Round 1
  { bookId: 'genesis',      chapter: 1,   verse: 1,  bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 23,  verse: 1,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'proverbs',     chapter: 3,   verse: 5,  bookEn: 'Proverbs',      bookPt: 'Provérbios'  },
  { bookId: 'matthew',      chapter: 5,   verse: 3,  bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john',         chapter: 3,   verse: 16, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 8,   verse: 28, bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 4,   verse: 13, bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 13,  verse: 4,  bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
  // Round 2
  { bookId: 'genesis',      chapter: 1,   verse: 3,  bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 23,  verse: 4,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'proverbs',     chapter: 3,   verse: 6,  bookEn: 'Proverbs',      bookPt: 'Provérbios'  },
  { bookId: 'matthew',      chapter: 5,   verse: 6,  bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john',         chapter: 3,   verse: 17, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 8,   verse: 38, bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 4,   verse: 7,  bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 13,  verse: 13, bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
  // Round 3
  { bookId: 'genesis',      chapter: 1,   verse: 27, bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 91,  verse: 1,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'proverbs',     chapter: 8,   verse: 11, bookEn: 'Proverbs',      bookPt: 'Provérbios'  },
  { bookId: 'matthew',      chapter: 5,   verse: 14, bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john',         chapter: 14,  verse: 6,  bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 12,  verse: 2,  bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 4,   verse: 4,  bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 13,  verse: 7,  bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
  // Round 4
  { bookId: 'genesis',      chapter: 22,  verse: 14, bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 121, verse: 1,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'proverbs',     chapter: 31,  verse: 25, bookEn: 'Proverbs',      bookPt: 'Provérbios'  },
  { bookId: 'matthew',      chapter: 6,   verse: 33, bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john',         chapter: 15,  verse: 5,  bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 8,   verse: 1,  bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 4,   verse: 6,  bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 13,  verse: 12, bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
  // Round 5
  { bookId: 'genesis',      chapter: 1,   verse: 31, bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 23,  verse: 6,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'proverbs',     chapter: 3,   verse: 13, bookEn: 'Proverbs',      bookPt: 'Provérbios'  },
  { bookId: 'matthew',      chapter: 28,  verse: 19, bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john',         chapter: 1,   verse: 1,  bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 8,   verse: 31, bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 4,   verse: 19, bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 13,  verse: 8,  bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
  // Round 6
  { bookId: 'genesis',      chapter: 22,  verse: 8,  bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 91,  verse: 11, bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'proverbs',     chapter: 31,  verse: 30, bookEn: 'Proverbs',      bookPt: 'Provérbios'  },
  { bookId: 'matthew',      chapter: 28,  verse: 20, bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john',         chapter: 1,   verse: 14, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 12,  verse: 21, bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 4,   verse: 11, bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 10,  verse: 13, bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
  // Round 7
  { bookId: 'genesis',      chapter: 1,   verse: 26, bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 121, verse: 2,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'proverbs',     chapter: 3,   verse: 7,  bookEn: 'Proverbs',      bookPt: 'Provérbios'  },
  { bookId: 'matthew',      chapter: 5,   verse: 8,  bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john',         chapter: 15,  verse: 13, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 8,   verse: 37, bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 1,   verse: 6,  bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 16,  verse: 13, bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
  // Round 8
  { bookId: 'genesis',      chapter: 1,   verse: 4,  bookEn: 'Genesis',       bookPt: 'Gênesis'     },
  { bookId: 'psalms',       chapter: 121, verse: 7,  bookEn: 'Psalms',        bookPt: 'Salmos'      },
  { bookId: 'proverbs',     chapter: 8,   verse: 35, bookEn: 'Proverbs',      bookPt: 'Provérbios'  },
  { bookId: 'matthew',      chapter: 6,   verse: 34, bookEn: 'Matthew',       bookPt: 'Mateus'      },
  { bookId: 'john',         chapter: 14,  verse: 27, bookEn: 'John',          bookPt: 'João'        },
  { bookId: 'romans',       chapter: 5,   verse: 1,  bookEn: 'Romans',        bookPt: 'Romanos'     },
  { bookId: 'philippians',  chapter: 2,   verse: 3,  bookEn: 'Philippians',   bookPt: 'Filipenses'  },
  { bookId: '1corinthians', chapter: 15,  verse: 55, bookEn: '1 Corinthians', bookPt: '1 Coríntios' },
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
