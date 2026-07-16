import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { applyReview } from '@/constants/srs';
import { EMPTY_STATS, recordStudy, currentStreak, type StudyStats } from '@/constants/stats';
import { publishAchievementEvent } from '@/context/AchievementContext';

const STORAGE_KEYS = {
  BOOKMARKS: '@bibliaeN:bookmarks',
  VOCABULARY: '@bibliaeN:vocabulary',
  PROGRESS: '@bibliaeN:progress',
  DISPLAY_MODE: '@bibliaeN:displayMode',
  FAVORITE_BOOKS: '@bibliaeN:favoriteBooks',
  NOTES: '@bibliaeN:notes',
  DEVOTIONAL_PLANS: '@bibliaeN:devotionalPlans',
  PLAN_VERSES: '@bibliaeN:planVerses',
  PLAN_VERSE_DONE: '@bibliaeN:planVerseDone',
  STUDY_STATS: '@bibliaeN:studyStats',
};

export type DisplayMode = 'both' | 'english' | 'portuguese';

export interface Bookmark {
  bookId: string;
  bookName: string;
  englishBookName: string;
  chapter: number;
  verse: number;
  en: string;
  pt: string;
  savedAt: number;
}

export interface VocabWord {
  word: string;
  translation: string;
  pronunciation: string;
  context: string;
  mastered: boolean;
  addedAt: number;
  // ── Spaced repetition (Leitner; see constants/srs.ts) ──
  // Optional so words saved before SRS existed keep working: absent fields
  // read as box 0 / due now, which is exactly how a new word should behave.
  srsLevel?: number;       // 0..SRS_MAX_LEVEL
  nextReviewAt?: number;   // epoch ms when the word is due again
  lastReviewedAt?: number; // epoch ms of the last review answer
}

export interface ReadingProgress {
  bookId: string;
  chapter: number;
  bookName: string;
  englishBookName: string;
}

// ── Personal notes — free-form study notes tied to a verse/chapter reference.
// Distinct from the Today's Study "Reflect" journal entry (a single, fixed
// reflection on John 1); these are user-created, multiple, and reusable
// across any passage.
export interface Note {
  id: string;
  bookId?: string;
  chapter?: number;
  verse?: number;
  reference: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

// ── Devotional plans — user-created collections of verses, distinct from the
// single rotating daily devotional. Curated starter plans live in
// constants/devotionalPlans.ts; plans created here are fully custom.
export interface DevotionalPlan {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface PlanVerseEntry {
  id: string;
  planId: string;
  bookId: string;
  chapter: number;
  verse: number;
  bookName: string;
  englishBookName: string;
  en: string;
  pt: string;
  addedAt: number;
}

interface BibleContextType {
  bookmarks: Bookmark[];
  vocabulary: VocabWord[];
  displayMode: DisplayMode;
  readingProgress: ReadingProgress | null;
  favoriteBooks: string[];
  notes: Note[];
  devotionalPlans: DevotionalPlan[];
  planVerses: PlanVerseEntry[];
  planVerseDone: Record<string, boolean>;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookId: string, chapter: number, verse: number) => void;
  isBookmarked: (bookId: string, chapter: number, verse: number) => boolean;
  addToVocabulary: (word: VocabWord) => void;
  removeFromVocabulary: (word: string) => void;
  toggleMastered: (word: string) => void;
  reviewWord: (word: string, remembered: boolean) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  saveReadingProgress: (progress: ReadingProgress) => void;
  /** Live study stats: real day-streak and totals (see constants/stats.ts). */
  studyStats: { streak: number; daysStudied: number };
  clearVocabulary: () => void;
  toggleFavoriteBook: (bookId: string) => void;
  isFavoriteBook: (bookId: string) => boolean;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, changes: Partial<Pick<Note, 'reference' | 'text'>>) => void;
  removeNote: (id: string) => void;
  addDevotionalPlan: (title: string, description: string) => DevotionalPlan;
  removeDevotionalPlan: (id: string) => void;
  addPlanVerse: (entry: Omit<PlanVerseEntry, 'id' | 'addedAt'>) => void;
  removePlanVerse: (id: string) => void;
  toggleVerseDone: (key: string) => void;
}

const BibleContext = createContext<BibleContextType | null>(null);

export function BibleProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([]);
  const [displayMode, setDisplayModeState] = useState<DisplayMode>('both');
  const [readingProgress, setReadingProgressState] = useState<ReadingProgress | null>(null);
  const [favoriteBooks, setFavoriteBooks] = useState<string[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [devotionalPlans, setDevotionalPlans] = useState<DevotionalPlan[]>([]);
  const [planVerses, setPlanVerses] = useState<PlanVerseEntry[]>([]);
  const [planVerseDone, setPlanVerseDone] = useState<Record<string, boolean>>({});
  const [studyStats, setStudyStats] = useState<StudyStats>(EMPTY_STATS);

  useEffect(() => {
    const safeParse = <T,>(raw: string | null): T | null => {
      if (!raw) return null;
      try { return JSON.parse(raw) as T; } catch { return null; }
    };

    (async () => {
      const [bmRaw, vocabRaw, modeRaw, progressRaw, favBooksRaw, notesRaw, plansRaw, planVersesRaw, planDoneRaw, statsRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.VOCABULARY).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_MODE).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.PROGRESS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_BOOKS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.NOTES).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.DEVOTIONAL_PLANS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.PLAN_VERSES).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.PLAN_VERSE_DONE).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.STUDY_STATS).catch(() => null),
      ]);
      const bm = safeParse<Bookmark[]>(bmRaw);
      if (bm) setBookmarks(bm);
      const vocab = safeParse<VocabWord[]>(vocabRaw);
      if (vocab) setVocabulary(vocab);
      if (modeRaw) setDisplayModeState(modeRaw as DisplayMode);
      const progress = safeParse<ReadingProgress>(progressRaw);
      if (progress) setReadingProgressState(progress);
      const favBooks = safeParse<string[]>(favBooksRaw);
      if (favBooks) setFavoriteBooks(favBooks);
      const notesParsed = safeParse<Note[]>(notesRaw);
      if (notesParsed) setNotes(notesParsed);
      const plansParsed = safeParse<DevotionalPlan[]>(plansRaw);
      if (plansParsed) setDevotionalPlans(plansParsed);
      const planVersesParsed = safeParse<PlanVerseEntry[]>(planVersesRaw);
      if (planVersesParsed) setPlanVerses(planVersesParsed);
      const planDoneParsed = safeParse<Record<string, boolean>>(planDoneRaw);
      if (planDoneParsed) setPlanVerseDone(planDoneParsed);
      const statsParsed = safeParse<StudyStats>(statsRaw);
      if (statsParsed) setStudyStats(statsParsed);
    })();
  }, []);

  const addBookmark = useCallback((bookmark: Bookmark) => {
    setBookmarks(prev => {
      const filtered = prev.filter(b => !(b.bookId === bookmark.bookId && b.chapter === bookmark.chapter && b.verse === bookmark.verse));
      const next = [bookmark, ...filtered];
      AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removeBookmark = useCallback((bookId: string, chapter: number, verse: number) => {
    setBookmarks(prev => {
      const next = prev.filter(b => !(b.bookId === bookId && b.chapter === chapter && b.verse === verse));
      AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isBookmarked = useCallback((bookId: string, chapter: number, verse: number) => {
    return bookmarks.some(b => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
  }, [bookmarks]);

  const addToVocabulary = useCallback((word: VocabWord) => {
    setVocabulary(prev => {
      const filtered = prev.filter(v => v.word !== word.word);
      const next = [word, ...filtered];
      AsyncStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(next)).catch(() => {});
      publishAchievementEvent({ type: 'vocab_totals', saved: next.length, mastered: next.filter(v => v.mastered).length });
      return next;
    });
  }, []);

  const removeFromVocabulary = useCallback((word: string) => {
    setVocabulary(prev => {
      const next = prev.filter(v => v.word !== word);
      AsyncStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleMastered = useCallback((word: string) => {
    setVocabulary(prev => {
      const next = prev.map(v => v.word === word ? { ...v, mastered: !v.mastered } : v);
      AsyncStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // Records one spaced-repetition review answer (see constants/srs.ts).
  const reviewWord = useCallback((word: string, remembered: boolean) => {
    setVocabulary(prev => {
      const next = prev.map(v => v.word === word ? applyReview(v, remembered) : v);
      AsyncStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify(next)).catch(() => {});
      publishAchievementEvent({ type: 'vocab_totals', saved: next.length, mastered: next.filter(v => v.mastered).length });
      return next;
    });
  }, []);

  const setDisplayMode = useCallback((mode: DisplayMode) => {
    setDisplayModeState(mode);
    AsyncStorage.setItem(STORAGE_KEYS.DISPLAY_MODE, mode).catch(() => {});
  }, []);

  const clearVocabulary = useCallback(() => {
    setVocabulary([]);
    AsyncStorage.setItem(STORAGE_KEYS.VOCABULARY, JSON.stringify([])).catch(() => {});
  }, []);

  const saveReadingProgress = useCallback((progress: ReadingProgress) => {
    setReadingProgressState(progress);
    AsyncStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress)).catch(() => {});
    // Opening a chapter counts as studying today — updates the real streak.
    setStudyStats(prev => {
      const next = recordStudy(prev);
      if (next === prev) return prev;
      AsyncStorage.setItem(STORAGE_KEYS.STUDY_STATS, JSON.stringify(next)).catch(() => {});
      publishAchievementEvent({ type: 'active_study_day', activeDays: next.daysStudied, streak: currentStreak(next) });
      return next;
    });
  }, []);

  const toggleFavoriteBook = useCallback((bookId: string) => {
    setFavoriteBooks(prev => {
      const next = prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId];
      AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_BOOKS, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isFavoriteBook = useCallback((bookId: string) => favoriteBooks.includes(bookId), [favoriteBooks]);

  // ── Personal notes ────────────────────────────────────────────────────────
  const addNote = useCallback((note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    publishAchievementEvent({ type: 'note_created' });
    const now = Date.now();
    const full: Note = { ...note, id: `note-${now}-${Math.random().toString(36).slice(2, 8)}`, createdAt: now, updatedAt: now };
    setNotes(prev => {
      const next = [full, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const updateNote = useCallback((id: string, changes: Partial<Pick<Note, 'reference' | 'text'>>) => {
    setNotes(prev => {
      const next = prev.map(n => n.id === id ? { ...n, ...changes, updatedAt: Date.now() } : n);
      AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removeNote = useCallback((id: string) => {
    setNotes(prev => {
      const next = prev.filter(n => n.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // ── Devotional plans ──────────────────────────────────────────────────────
  const addDevotionalPlan = useCallback((title: string, description: string) => {
    const plan: DevotionalPlan = { id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, description, createdAt: Date.now() };
    setDevotionalPlans(prev => {
      const next = [plan, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.DEVOTIONAL_PLANS, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return plan;
  }, []);

  const removeDevotionalPlan = useCallback((id: string) => {
    setDevotionalPlans(prev => {
      const next = prev.filter(p => p.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.DEVOTIONAL_PLANS, JSON.stringify(next)).catch(() => {});
      return next;
    });
    setPlanVerses(prev => {
      const next = prev.filter(v => v.planId !== id);
      AsyncStorage.setItem(STORAGE_KEYS.PLAN_VERSES, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const addPlanVerse = useCallback((entry: Omit<PlanVerseEntry, 'id' | 'addedAt'>) => {
    const full: PlanVerseEntry = { ...entry, id: `pv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, addedAt: Date.now() };
    setPlanVerses(prev => {
      const exists = prev.some(v => v.planId === full.planId && v.bookId === full.bookId && v.chapter === full.chapter && v.verse === full.verse);
      const next = exists ? prev : [full, ...prev];
      AsyncStorage.setItem(STORAGE_KEYS.PLAN_VERSES, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removePlanVerse = useCallback((id: string) => {
    setPlanVerses(prev => {
      const next = prev.filter(v => v.id !== id);
      AsyncStorage.setItem(STORAGE_KEYS.PLAN_VERSES, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleVerseDone = useCallback((key: string) => {
    setPlanVerseDone(prev => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(STORAGE_KEYS.PLAN_VERSE_DONE, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return (
    <BibleContext.Provider value={{
      bookmarks,
      vocabulary,
      displayMode,
      readingProgress,
      favoriteBooks,
      notes,
      devotionalPlans,
      planVerses,
      planVerseDone,
      addBookmark,
      removeBookmark,
      isBookmarked,
      addToVocabulary,
      removeFromVocabulary,
      toggleMastered,
      reviewWord,
      setDisplayMode,
      saveReadingProgress,
      studyStats: { streak: currentStreak(studyStats), daysStudied: studyStats.daysStudied },
      clearVocabulary,
      toggleFavoriteBook,
      isFavoriteBook,
      addNote,
      updateNote,
      removeNote,
      addDevotionalPlan,
      removeDevotionalPlan,
      addPlanVerse,
      removePlanVerse,
      toggleVerseDone,
    }}>
      {children}
    </BibleContext.Provider>
  );
}

export function useBible() {
  const ctx = useContext(BibleContext);
  if (!ctx) throw new Error('useBible must be used within BibleProvider');
  return ctx;
}
