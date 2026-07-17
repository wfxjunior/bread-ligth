// ── Prayer Journey — data model & curated content ────────────────────────────
// A personal record of walking with God: prayers, their seasons (praying →
// waiting → answered), and Memorials — the "stones of remembrance" (Joshua 4)
// built from answered prayers. Pure data + helpers; persistence lives in
// context/PrayerContext, UI in app/prayer*.tsx.
//
// Future-ready: `privacy` already models family/group/public sharing and every
// record carries a timeline, so cloud sync and shared prayer groups can be
// layered on without migrating local data.

import type { I18nKey } from '@/constants/i18n';

export type PrayerStatus = 'praying' | 'waiting' | 'answered' | 'archived';
export type PrayerCategory =
  | 'work' | 'health' | 'family' | 'relationships' | 'hope'
  | 'guidance' | 'provision' | 'gratitude' | 'other';
export type PrayerPrivacy = 'private' | 'family' | 'group' | 'public';
export type PrayerReminder = 'none' | 'daily' | 'weekly';

export interface PrayerNote {
  at: string; // ISO
  text: string;
}

export interface PrayerEvent {
  at: string; // ISO
  type: 'created' | 'status' | 'note' | 'answered' | 'prayed';
  status?: PrayerStatus;
}

export interface Prayer {
  id: string;
  title: string;
  description: string;
  category: PrayerCategory;
  status: PrayerStatus;
  privacy: PrayerPrivacy;
  favorite: boolean;
  reminder: PrayerReminder;
  createdAt: string; // ISO
  /** Bumped on every mutation — the last-write-wins key for cloud sync. */
  updatedAt: string; // ISO
  answeredAt: string | null;
  lastPrayedAt: string | null;
  /** Optional passage this prayer rests on, e.g. { bookId: 'psalms', chapter: 23 } */
  scripture: { bookId: string; chapter: number } | null;
  /** "How did God answer?" — written by the user when marking answered. */
  testimony: string | null;
  notes: PrayerNote[];
  timeline: PrayerEvent[];
}

// ── Status metadata ──────────────────────────────────────────────────────────
export const STATUS_META: Record<PrayerStatus, { icon: string; labelKey: I18nKey }> = {
  praying: { icon: 'heart', labelKey: 'pr_status_praying' },
  waiting: { icon: 'clock', labelKey: 'pr_status_waiting' },
  answered: { icon: 'check-circle', labelKey: 'pr_status_answered' },
  archived: { icon: 'archive', labelKey: 'pr_status_archived' },
};

export const STATUS_ORDER: PrayerStatus[] = ['praying', 'waiting', 'answered', 'archived'];

// ── Categories (Feather icons) ───────────────────────────────────────────────
export const CATEGORY_META: Record<PrayerCategory, { icon: string; labelKey: I18nKey }> = {
  work: { icon: 'briefcase', labelKey: 'pr_cat_work' },
  health: { icon: 'activity', labelKey: 'pr_cat_health' },
  family: { icon: 'home', labelKey: 'pr_cat_family' },
  relationships: { icon: 'users', labelKey: 'pr_cat_relationships' },
  hope: { icon: 'sunrise', labelKey: 'pr_cat_hope' },
  guidance: { icon: 'compass', labelKey: 'pr_cat_guidance' },
  provision: { icon: 'shopping-bag', labelKey: 'pr_cat_provision' },
  gratitude: { icon: 'gift', labelKey: 'pr_cat_gratitude' },
  other: { icon: 'feather', labelKey: 'pr_cat_other' },
};

export const CATEGORY_ORDER: PrayerCategory[] = [
  'work', 'health', 'family', 'relationships', 'hope', 'guidance', 'provision', 'gratitude', 'other',
];

// ── Scripture suggestions per category ───────────────────────────────────────
// Curated passages that naturally accompany each kind of prayer. Each entry
// opens the real chapter in the reader. Labels use English book names — the
// reader itself is bilingual.
export interface ScriptureSuggestion { bookId: string; chapter: number; label: string }

export const SCRIPTURE_SUGGESTIONS: Record<PrayerCategory, ScriptureSuggestion[]> = {
  work: [
    { bookId: 'proverbs', chapter: 16, label: 'Proverbs 16' },
    { bookId: 'psalms', chapter: 37, label: 'Psalm 37' },
    { bookId: 'joshua', chapter: 1, label: 'Joshua 1' },
    { bookId: 'matthew', chapter: 6, label: 'Matthew 6' },
  ],
  health: [
    { bookId: 'psalms', chapter: 91, label: 'Psalm 91' },
    { bookId: 'james', chapter: 5, label: 'James 5' },
    { bookId: 'isaiah', chapter: 41, label: 'Isaiah 41' },
  ],
  family: [
    { bookId: 'joshua', chapter: 24, label: 'Joshua 24' },
    { bookId: 'psalms', chapter: 127, label: 'Psalm 127' },
    { bookId: 'ephesians', chapter: 6, label: 'Ephesians 6' },
  ],
  relationships: [
    { bookId: '1corinthians', chapter: 13, label: '1 Corinthians 13' },
    { bookId: 'colossians', chapter: 3, label: 'Colossians 3' },
    { bookId: 'romans', chapter: 12, label: 'Romans 12' },
  ],
  hope: [
    { bookId: 'romans', chapter: 8, label: 'Romans 8' },
    { bookId: 'psalms', chapter: 23, label: 'Psalm 23' },
    { bookId: 'isaiah', chapter: 40, label: 'Isaiah 40' },
  ],
  guidance: [
    { bookId: 'proverbs', chapter: 3, label: 'Proverbs 3' },
    { bookId: 'psalms', chapter: 25, label: 'Psalm 25' },
    { bookId: 'james', chapter: 1, label: 'James 1' },
  ],
  provision: [
    { bookId: 'matthew', chapter: 6, label: 'Matthew 6' },
    { bookId: 'philippians', chapter: 4, label: 'Philippians 4' },
    { bookId: 'psalms', chapter: 34, label: 'Psalm 34' },
  ],
  gratitude: [
    { bookId: 'psalms', chapter: 100, label: 'Psalm 100' },
    { bookId: 'psalms', chapter: 103, label: 'Psalm 103' },
    { bookId: '1thessalonians', chapter: 5, label: '1 Thessalonians 5' },
  ],
  other: [
    { bookId: 'psalms', chapter: 62, label: 'Psalm 62' },
    { bookId: 'philippians', chapter: 4, label: 'Philippians 4' },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const DAY_MS = 86400000;

export function daysSince(iso: string): number {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS));
}

/** Whole days between creation and answer — the "waiting time" on a Memorial. */
export function waitingDays(p: Prayer): number {
  if (!p.answeredAt) return daysSince(p.createdAt);
  return Math.max(0, Math.floor((new Date(p.answeredAt).getTime() - new Date(p.createdAt).getTime()) / DAY_MS));
}

export function newPrayerId(): string {
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Local calendar day key (device timezone) — same convention as stats.ts. */
export function dayKey(d = new Date()): string {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Consecutive-day prayer streak ending today or yesterday (grace day). */
export function prayerStreak(prayedDays: string[]): number {
  if (prayedDays.length === 0) return 0;
  const set = new Set(prayedDays);
  const today = new Date();
  const probe = new Date(today);
  if (!set.has(dayKey(probe))) probe.setDate(probe.getDate() - 1); // allow "yesterday" grace
  if (!set.has(dayKey(probe))) return 0;
  let streak = 0;
  while (set.has(dayKey(probe))) {
    streak += 1;
    probe.setDate(probe.getDate() - 1);
  }
  return streak;
}
