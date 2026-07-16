// ── Study streak — real consecutive-day tracking ─────────────────────────────
// Replaces the old hardcoded "7 day streak" mock. A day counts as studied the
// moment the reader opens a chapter (see BibleContext.saveReadingProgress).
// Dates are compared as local YYYY-MM-DD strings so a streak is about calendar
// days in the reader's own timezone, not 24h windows.

export interface StudyStats {
  /** Local YYYY-MM-DD of the most recent day with study activity. */
  lastStudyDate: string | null;
  /** Consecutive-day count ending on lastStudyDate. */
  streak: number;
  /** Total distinct days the reader has studied (all-time). */
  daysStudied: number;
}

export const EMPTY_STATS: StudyStats = {
  lastStudyDate: null,
  streak: 0,
  daysStudied: 0,
};

/** Local calendar date as YYYY-MM-DD (not UTC — matches what the reader sees). */
export function localDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysBetween(a: string, b: string): number {
  // Parse as local midnights; difference in whole days.
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  const da = new Date(ay, am - 1, ad).getTime();
  const db = new Date(by, bm - 1, bd).getTime();
  return Math.round((db - da) / (24 * 60 * 60 * 1000));
}

/**
 * Records study activity for `today` and returns the updated stats.
 * - same day as last → unchanged (studying twice in a day isn't a new streak day)
 * - exactly the next day → streak grows by one
 * - a gap of 2+ days → streak resets to 1 (today restarts it)
 */
export function recordStudy(stats: StudyStats, today = localDateKey()): StudyStats {
  if (stats.lastStudyDate === today) return stats;

  let streak: number;
  if (stats.lastStudyDate && daysBetween(stats.lastStudyDate, today) === 1) {
    streak = stats.streak + 1;
  } else {
    streak = 1;
  }

  return {
    lastStudyDate: today,
    streak,
    daysStudied: stats.daysStudied + 1,
  };
}

/**
 * The streak to *display*. A stored streak is only "alive" if the last study
 * day was today or yesterday; otherwise the chain is broken and shows 0 until
 * the reader studies again.
 */
export function currentStreak(stats: StudyStats, today = localDateKey()): number {
  if (!stats.lastStudyDate) return 0;
  const gap = daysBetween(stats.lastStudyDate, today);
  if (gap <= 0) return stats.streak;        // studied today
  if (gap === 1) return stats.streak;       // studied yesterday — still alive today
  return 0;                                  // chain broken
}
