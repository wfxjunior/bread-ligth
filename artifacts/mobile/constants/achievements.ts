// ── Medals (achievements) ─────────────────────────────────────────────────────
// Every medal is earned from REAL tracked data — no mock progress. Inputs come
// from BibleContext (vocabulary, bookmarks, notes) and the study-streak stats
// (constants/stats.ts). Pure functions so the unlock rules are testable.

export interface AchievementInputs {
  streak: number;        // current live streak (days)
  daysStudied: number;   // total distinct study days
  wordsSaved: number;    // vocabulary.length
  wordsMastered: number; // vocabulary mastered count
  versesSaved: number;   // bookmarks.length
  notesCount: number;    // notes.length
}

export interface MedalDef {
  id: string;
  /** Feather icon name */
  icon: string;
  /** which input drives progress */
  metric: keyof AchievementInputs;
  threshold: number;
}

// Ordered roughly by how early a reader will earn them.
export const MEDALS: MedalDef[] = [
  { id: 'first_light',   icon: 'sunrise',   metric: 'daysStudied',  threshold: 1 },
  { id: 'gatherer',      icon: 'book-open', metric: 'wordsSaved',   threshold: 10 },
  { id: 'faithful_week', icon: 'zap',       metric: 'streak',       threshold: 7 },
  { id: 'treasurer',     icon: 'bookmark',  metric: 'versesSaved',  threshold: 25 },
  { id: 'scribe',        icon: 'edit-3',    metric: 'notesCount',   threshold: 10 },
  { id: 'master_10',     icon: 'award',     metric: 'wordsMastered', threshold: 10 },
  { id: 'wordsmith',     icon: 'layers',    metric: 'wordsSaved',   threshold: 50 },
  { id: 'pilgrim',       icon: 'map',       metric: 'daysStudied',  threshold: 30 },
  { id: 'faithful_month', icon: 'calendar', metric: 'streak',       threshold: 30 },
  { id: 'master_50',     icon: 'star',      metric: 'wordsMastered', threshold: 50 },
];

export interface MedalState extends MedalDef {
  earned: boolean;
  /** 0..1 toward the threshold (clamped) */
  progress: number;
  current: number;
}

export function computeMedals(inputs: AchievementInputs): MedalState[] {
  return MEDALS.map(m => {
    const current = Math.max(0, inputs[m.metric] ?? 0);
    return {
      ...m,
      current,
      earned: current >= m.threshold,
      progress: Math.min(1, current / m.threshold),
    };
  });
}

export function earnedCount(states: MedalState[]): number {
  return states.filter(s => s.earned).length;
}
