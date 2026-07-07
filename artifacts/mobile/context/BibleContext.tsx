import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  BOOKMARKS: '@bibliaeN:bookmarks',
  VOCABULARY: '@bibliaeN:vocabulary',
  PROGRESS: '@bibliaeN:progress',
  DISPLAY_MODE: '@bibliaeN:displayMode',
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
}

export interface ReadingProgress {
  bookId: string;
  chapter: number;
  bookName: string;
  englishBookName: string;
}

interface BibleContextType {
  bookmarks: Bookmark[];
  vocabulary: VocabWord[];
  displayMode: DisplayMode;
  readingProgress: ReadingProgress | null;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (bookId: string, chapter: number, verse: number) => void;
  isBookmarked: (bookId: string, chapter: number, verse: number) => boolean;
  addToVocabulary: (word: VocabWord) => void;
  removeFromVocabulary: (word: string) => void;
  toggleMastered: (word: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  saveReadingProgress: (progress: ReadingProgress) => void;
  clearVocabulary: () => void;
}

const BibleContext = createContext<BibleContextType | null>(null);

export function BibleProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [vocabulary, setVocabulary] = useState<VocabWord[]>([]);
  const [displayMode, setDisplayModeState] = useState<DisplayMode>('both');
  const [readingProgress, setReadingProgressState] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    const safeParse = <T,>(raw: string | null): T | null => {
      if (!raw) return null;
      try { return JSON.parse(raw) as T; } catch { return null; }
    };

    (async () => {
      const [bmRaw, vocabRaw, modeRaw, progressRaw] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.VOCABULARY).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.DISPLAY_MODE).catch(() => null),
        AsyncStorage.getItem(STORAGE_KEYS.PROGRESS).catch(() => null),
      ]);
      const bm = safeParse<Bookmark[]>(bmRaw);
      if (bm) setBookmarks(bm);
      const vocab = safeParse<VocabWord[]>(vocabRaw);
      if (vocab) setVocabulary(vocab);
      if (modeRaw) setDisplayModeState(modeRaw as DisplayMode);
      const progress = safeParse<ReadingProgress>(progressRaw);
      if (progress) setReadingProgressState(progress);
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
  }, []);

  return (
    <BibleContext.Provider value={{
      bookmarks,
      vocabulary,
      displayMode,
      readingProgress,
      addBookmark,
      removeBookmark,
      isBookmarked,
      addToVocabulary,
      removeFromVocabulary,
      toggleMastered,
      setDisplayMode,
      saveReadingProgress,
      clearVocabulary,
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
