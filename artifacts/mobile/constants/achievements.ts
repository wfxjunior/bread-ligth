// ── Journey Honors — achievement engine (pure logic) ─────────────────────────
// Philosophy: "We do not reward speed. We recognize consistency, growth and
// meaningful participation." Every honor is earned from verified product
// events; the UI displays results, it never decides. No coins, no ranks, no
// confetti — a personal archive of meaningful milestones.
//
// Pure & testable: applyEvent(state, event) → { state, newlyEarned }.
// Persistence and event wiring live in context/AchievementContext.tsx.
// Community/Legacy honors (Founding Member, First 100, Premium…) are
// SERVER-controlled (see api-server /api/recognitions) — never client-derived.

export type Collection = 'reading' | 'listening' | 'learning' | 'devotional' | 'community';
export type Tier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'legacy';
export const TIER_ORDER: Tier[] = ['bronze', 'silver', 'gold', 'platinum', 'legacy'];

// ── Metrics accumulated from events ──────────────────────────────────────────
export interface Metrics {
  versesRead: number;
  chaptersCompleted: number;            // real completion, not chapter opens
  chapterProgress: Record<string, number[]>; // bookId -> completed chapter numbers
  bookTotals: Record<string, number>;   // bookId -> total chapters (learned from events)
  booksCompleted: string[];             // bookIds
  listeningSeconds: number;             // only meaningful playback deltas
  audioChapters: Record<string, number[]>; // chapters fully heard
  audioChaptersCompleted: number;
  wordsSaved: number;                   // absolute (from vocabulary length)
  wordsMastered: number;                // absolute
  vocabReviews: number;                 // completed review sessions
  pronunciationSessions: number;
  devotionalsCompleted: number;
  lastDevotionalDay: string | null;     // YYYY-MM-DD — one per day
  notesCreated: number;                 // monotonic; deletions never decrement
  activeDays: number;                   // absolute (from study stats)
  streak: number;                       // live streak (display/consistency)
}

export const EMPTY_METRICS: Metrics = {
  versesRead: 0,
  chaptersCompleted: 0,
  chapterProgress: {},
  bookTotals: {},
  booksCompleted: [],
  listeningSeconds: 0,
  audioChapters: {},
  audioChaptersCompleted: 0,
  wordsSaved: 0,
  wordsMastered: 0,
  vocabReviews: 0,
  pronunciationSessions: 0,
  devotionalsCompleted: 0,
  lastDevotionalDay: null,
  notesCreated: 0,
  activeDays: 0,
  streak: 0,
};

// ── Verified product events ───────────────────────────────────────────────────
export type AchievementEvent =
  | { type: 'verse_read' }
  | { type: 'chapter_completed'; bookId: string; chapter: number; totalChapters: number }
  | { type: 'audio_progressed'; seconds: number } // caller sends real playback deltas
  | { type: 'audio_chapter_completed'; bookId: string; chapter: number }
  | { type: 'vocab_totals'; saved: number; mastered: number } // absolute, idempotent
  | { type: 'vocabulary_review_completed' }
  | { type: 'pronunciation_session_completed' }
  | { type: 'devotional_completed'; dayKey: string }
  | { type: 'note_created' }
  | { type: 'active_study_day'; activeDays: number; streak: number }; // absolute

// Anti-farming: a single audio tick can never claim more than this many seconds.
const MAX_AUDIO_DELTA_S = 30;

// ── Definitions: evolving families + single honors ───────────────────────────
export interface FamilyDef {
  kind: 'family';
  id: string;
  collection: Collection;
  icon: string; // Feather
  metric: keyof Pick<Metrics,
    'chaptersCompleted' | 'listeningSeconds' | 'wordsSaved' | 'wordsMastered' |
    'vocabReviews' | 'devotionalsCompleted' | 'activeDays' | 'pronunciationSessions'>;
  tiers: { tier: Tier; threshold: number }[];
}
export interface SingleDef {
  kind: 'single';
  id: string;
  collection: Collection;
  icon: string;
  metric?: FamilyDef['metric'] | 'audioChaptersCompleted' | 'notesCreated' | 'versesRead';
  threshold?: number;
  /** completes when this bookId is fully read */
  bookId?: string;
  hidden?: boolean;
}
export type AchievementDef = FamilyDef | SingleDef;

const H = 3600;

export const DEFINITIONS: AchievementDef[] = [
  // ── READING ──
  { kind: 'single', id: 'first_verse',    collection: 'reading', icon: 'book-open', metric: 'versesRead', threshold: 1 },
  { kind: 'single', id: 'first_chapter',  collection: 'reading', icon: 'bookmark',  metric: 'chaptersCompleted', threshold: 1 },
  { kind: 'family', id: 'consistent_reader', collection: 'reading', icon: 'sunrise', metric: 'activeDays',
    tiers: [
      { tier: 'bronze', threshold: 7 }, { tier: 'silver', threshold: 30 },
      { tier: 'gold', threshold: 100 }, { tier: 'platinum', threshold: 365 },
      { tier: 'legacy', threshold: 1000 },
    ] },
  { kind: 'family', id: 'chapters_read', collection: 'reading', icon: 'layers', metric: 'chaptersCompleted',
    tiers: [
      { tier: 'bronze', threshold: 10 }, { tier: 'silver', threshold: 50 },
      { tier: 'gold', threshold: 100 }, { tier: 'platinum', threshold: 500 },
      { tier: 'legacy', threshold: 1000 },
    ] },
  { kind: 'single', id: 'proverbs_complete', collection: 'reading', icon: 'feather', bookId: 'proverbs' },
  { kind: 'single', id: 'psalms_complete',   collection: 'reading', icon: 'music',   bookId: 'psalms' },
  { kind: 'single', id: 'john_complete',     collection: 'reading', icon: 'sun',     bookId: 'john' },

  // ── LISTENING ──
  { kind: 'single', id: 'first_chapter_heard', collection: 'listening', icon: 'headphones', metric: 'audioChaptersCompleted', threshold: 1 },
  { kind: 'family', id: 'listening_hours', collection: 'listening', icon: 'volume-2', metric: 'listeningSeconds',
    tiers: [
      { tier: 'bronze', threshold: 1 * H }, { tier: 'silver', threshold: 5 * H },
      { tier: 'gold', threshold: 10 * H }, { tier: 'platinum', threshold: 50 * H },
      { tier: 'legacy', threshold: 100 * H },
    ] },

  // ── LEARNING ──
  { kind: 'single', id: 'first_word', collection: 'learning', icon: 'plus-circle', metric: 'wordsSaved', threshold: 1 },
  { kind: 'family', id: 'words_learned', collection: 'learning', icon: 'book', metric: 'wordsSaved',
    tiers: [
      { tier: 'bronze', threshold: 25 }, { tier: 'silver', threshold: 100 },
      { tier: 'gold', threshold: 500 }, { tier: 'platinum', threshold: 1000 },
    ] },
  { kind: 'family', id: 'words_mastered', collection: 'learning', icon: 'award', metric: 'wordsMastered',
    tiers: [
      { tier: 'bronze', threshold: 10 }, { tier: 'silver', threshold: 50 },
      { tier: 'gold', threshold: 200 },
    ] },
  { kind: 'single', id: 'first_pronunciation', collection: 'learning', icon: 'mic', metric: 'pronunciationSessions', threshold: 1 },
  { kind: 'family', id: 'study_sessions', collection: 'learning', icon: 'edit-3', metric: 'vocabReviews',
    tiers: [
      { tier: 'bronze', threshold: 5 }, { tier: 'silver', threshold: 25 },
      { tier: 'gold', threshold: 100 },
    ] },

  // ── DEVOTIONAL ──
  { kind: 'single', id: 'first_devotional', collection: 'devotional', icon: 'coffee', metric: 'devotionalsCompleted', threshold: 1 },
  { kind: 'family', id: 'devotional_path', collection: 'devotional', icon: 'heart', metric: 'devotionalsCompleted',
    tiers: [
      { tier: 'bronze', threshold: 7 }, { tier: 'silver', threshold: 30 },
      { tier: 'gold', threshold: 100 },
    ] },
  { kind: 'single', id: 'first_note', collection: 'devotional', icon: 'file-text', metric: 'notesCreated', threshold: 1 },
];

// Community honors are defined for DISPLAY only — earning is server-side.
export const COMMUNITY_HONORS = [
  { id: 'founding_member',  icon: 'key' },
  { id: 'first_100',        icon: 'users' },
  { id: 'beta_tester',      icon: 'tool' },
  { id: 'premium_member',   icon: 'star' },
  { id: 'founding_premium', icon: 'shield' },
] as const;
export type RecognitionType = (typeof COMMUNITY_HONORS)[number]['id'];

// ── Earned records — a tier, once earned, is never lost ──────────────────────
export interface EarnedRecord { earnedAt: number; tier?: Tier }
export interface EngineState {
  metrics: Metrics;
  /** key: single id, or `${familyId}:${tier}` */
  earned: Record<string, EarnedRecord>;
}
export const EMPTY_STATE: EngineState = { metrics: EMPTY_METRICS, earned: {} };

export interface NewHonor { defId: string; tier?: Tier }

// ── Event application (idempotent where the event allows it) ─────────────────
function applyToMetrics(m: Metrics, e: AchievementEvent): Metrics {
  switch (e.type) {
    case 'verse_read':
      return { ...m, versesRead: m.versesRead + 1 };
    case 'chapter_completed': {
      const done = m.chapterProgress[e.bookId] ?? [];
      if (done.includes(e.chapter)) return m; // duplicate — no farm
      const nextDone = [...done, e.chapter];
      const bookTotals = { ...m.bookTotals, [e.bookId]: e.totalChapters };
      const finishedBook = nextDone.length >= e.totalChapters && !m.booksCompleted.includes(e.bookId);
      return {
        ...m,
        chapterProgress: { ...m.chapterProgress, [e.bookId]: nextDone },
        bookTotals,
        chaptersCompleted: m.chaptersCompleted + 1,
        booksCompleted: finishedBook ? [...m.booksCompleted, e.bookId] : m.booksCompleted,
      };
    }
    case 'audio_progressed': {
      const delta = Math.max(0, Math.min(MAX_AUDIO_DELTA_S, e.seconds));
      if (delta === 0) return m;
      return { ...m, listeningSeconds: m.listeningSeconds + delta };
    }
    case 'audio_chapter_completed': {
      const heard = m.audioChapters[e.bookId] ?? [];
      if (heard.includes(e.chapter)) return m;
      return {
        ...m,
        audioChapters: { ...m.audioChapters, [e.bookId]: [...heard, e.chapter] },
        audioChaptersCompleted: m.audioChaptersCompleted + 1,
      };
    }
    case 'vocab_totals':
      // Absolute values; never decrease (deleting words shouldn't revoke honors).
      return {
        ...m,
        wordsSaved: Math.max(m.wordsSaved, e.saved),
        wordsMastered: Math.max(m.wordsMastered, e.mastered),
      };
    case 'vocabulary_review_completed':
      return { ...m, vocabReviews: m.vocabReviews + 1 };
    case 'pronunciation_session_completed':
      return { ...m, pronunciationSessions: m.pronunciationSessions + 1 };
    case 'devotional_completed':
      if (m.lastDevotionalDay === e.dayKey) return m; // one per day
      return { ...m, devotionalsCompleted: m.devotionalsCompleted + 1, lastDevotionalDay: e.dayKey };
    case 'note_created':
      return { ...m, notesCreated: m.notesCreated + 1 };
    case 'active_study_day':
      return { ...m, activeDays: Math.max(m.activeDays, e.activeDays), streak: e.streak };
    default:
      return m;
  }
}

function metricValue(m: Metrics, def: AchievementDef): number {
  if (def.kind === 'single' && def.bookId) return m.booksCompleted.includes(def.bookId) ? 1 : 0;
  const key = (def.kind === 'family' ? def.metric : def.metric)!;
  return (m[key] as number) ?? 0;
}

/** Applies one event; returns the next state and any newly earned honors. */
export function applyEvent(state: EngineState, e: AchievementEvent, now = Date.now()): { state: EngineState; newlyEarned: NewHonor[] } {
  const metrics = applyToMetrics(state.metrics, e);
  if (metrics === state.metrics) return { state, newlyEarned: [] };

  const earned = { ...state.earned };
  const newlyEarned: NewHonor[] = [];

  for (const def of DEFINITIONS) {
    const value = metricValue(metrics, def);
    if (def.kind === 'single') {
      const threshold = def.bookId ? 1 : (def.threshold ?? 1);
      if (value >= threshold && !earned[def.id]) {
        earned[def.id] = { earnedAt: now };
        newlyEarned.push({ defId: def.id });
      }
    } else {
      for (const t of def.tiers) {
        const key = `${def.id}:${t.tier}`;
        if (value >= t.threshold && !earned[key]) {
          earned[key] = { earnedAt: now, tier: t.tier };
          newlyEarned.push({ defId: def.id, tier: t.tier });
        }
      }
    }
  }

  return { state: { metrics, earned }, newlyEarned };
}

// ── Display helpers ───────────────────────────────────────────────────────────
export interface FamilyView {
  def: FamilyDef;
  currentTier: Tier | null;
  nextTier: { tier: Tier; threshold: number } | null;
  value: number;
  progressToNext: number; // 0..1
  earnedAt?: number;
}
export interface SingleView {
  def: SingleDef;
  earned: boolean;
  value: number;
  threshold: number;
  progress: number;
  earnedAt?: number;
}

export function familyView(state: EngineState, def: FamilyDef): FamilyView {
  const value = metricValue(state.metrics, def);
  let currentTier: Tier | null = null;
  let earnedAt: number | undefined;
  for (const t of def.tiers) {
    const rec = state.earned[`${def.id}:${t.tier}`];
    if (rec) { currentTier = t.tier; earnedAt = rec.earnedAt; }
  }
  const nextTier = def.tiers.find(t => !state.earned[`${def.id}:${t.tier}`]) ?? null;
  const prevThreshold = currentTier ? def.tiers.find(t => t.tier === currentTier)!.threshold : 0;
  const progressToNext = nextTier
    ? Math.min(1, Math.max(0, (value - prevThreshold) / (nextTier.threshold - prevThreshold)))
    : 1;
  return { def, currentTier, nextTier, value, progressToNext, earnedAt };
}

export function singleView(state: EngineState, def: SingleDef): SingleView {
  const value = metricValue(state.metrics, def);
  const threshold = def.bookId ? 1 : (def.threshold ?? 1);
  const rec = state.earned[def.id];
  return { def, earned: !!rec, value, threshold, progress: Math.min(1, value / threshold), earnedAt: rec?.earnedAt };
}

export function collectionDefs(c: Collection): AchievementDef[] {
  return DEFINITIONS.filter(d => d.collection === c);
}

export function totalEarned(state: EngineState): number {
  return Object.keys(state.earned).length;
}

// Journey title (calm, optional; product activity only — never spiritual rank).
export function journeyTitleKey(m: Metrics): string {
  if (m.activeDays >= 365) return 'journey_title_steward';
  if (m.activeDays >= 100) return 'journey_title_disciple';
  if (m.activeDays >= 30) return 'journey_title_explorer';
  if (m.chaptersCompleted >= 10 || m.activeDays >= 7) return 'journey_title_student';
  if (m.versesRead >= 1) return 'journey_title_reader';
  return 'journey_title_seeker';
}
