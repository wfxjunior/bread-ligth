import type { VocabWord } from '@/context/BibleContext';

// ── Spaced repetition (Leitner system) ────────────────────────────────────────
// Each saved word climbs boxes 0→5 as the reader recalls it in review sessions
// and falls back to box 0 when they don't. Review intervals grow with the box,
// so well-known words show up rarely and struggling words show up daily.
// Words that reach the top box are considered mastered.

export const SRS_MAX_LEVEL = 5;

// Days until the next review for each box. Box 0 = due immediately.
const INTERVAL_DAYS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function nextReviewDelayMs(level: number): number {
  const clamped = Math.max(0, Math.min(SRS_MAX_LEVEL, level));
  return (INTERVAL_DAYS[clamped] ?? 0) * DAY_MS;
}

/** A word is due when it has never been reviewed or its schedule has arrived. */
export function isDueForReview(word: VocabWord, now = Date.now()): boolean {
  if (word.mastered && (word.srsLevel ?? 0) >= SRS_MAX_LEVEL) {
    // Mastered words still resurface on the longest interval so they aren't
    // forgotten forever — mastery is maintained, not archived.
    return (word.nextReviewAt ?? 0) <= now;
  }
  return (word.nextReviewAt ?? 0) <= now;
}

export function dueWords(vocabulary: VocabWord[], now = Date.now()): VocabWord[] {
  return vocabulary
    .filter(w => isDueForReview(w, now))
    // Struggling words (lower boxes) come first in a session.
    .sort((a, b) => (a.srsLevel ?? 0) - (b.srsLevel ?? 0));
}

/**
 * Applies one review result and returns the updated word.
 * remembered=true climbs one box; false sends the word back to box 0 (due
 * again tomorrow rather than instantly, to avoid an immediate re-ask loop).
 */
export function applyReview(word: VocabWord, remembered: boolean, now = Date.now()): VocabWord {
  const current = word.srsLevel ?? 0;
  const level = remembered ? Math.min(SRS_MAX_LEVEL, current + 1) : 0;
  return {
    ...word,
    srsLevel: level,
    lastReviewedAt: now,
    nextReviewAt: now + (remembered ? nextReviewDelayMs(level) : DAY_MS),
    mastered: level >= SRS_MAX_LEVEL,
  };
}
