import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_READING_SPACE,
  READING_SPACE_STORAGE_KEY,
  READING_SPACES,
  type ReadingSpace,
} from '../lib/reading-spaces';

interface ReadingSpaceContextValue {
  readingSpace: ReadingSpace;
  setReadingSpace: (id: ReadingSpace) => void;
  space: typeof READING_SPACES[ReadingSpace];
}

const ReadingSpaceContext = createContext<ReadingSpaceContextValue | null>(null);

function readStored(): ReadingSpace {
  try {
    const v = localStorage.getItem(READING_SPACE_STORAGE_KEY);
    if (v && v in READING_SPACES) return v as ReadingSpace;
  } catch {
    // localStorage unavailable (private mode, SSR) — fall back to default.
  }
  return DEFAULT_READING_SPACE;
}

export function ReadingSpaceProvider({ children }: { children: React.ReactNode }) {
  const [readingSpace, setReadingSpaceState] = useState<ReadingSpace>(readStored);

  const setReadingSpace = (id: ReadingSpace) => {
    setReadingSpaceState(id);
    try {
      localStorage.setItem(READING_SPACE_STORAGE_KEY, id);
    } catch {
      // ignore write failures — the in-memory value still applies this session.
    }
  };

  // Keep the browser scrollbar/UI chrome in sync with dark-vs-light spaces.
  useEffect(() => {
    document.documentElement.style.colorScheme = READING_SPACES[readingSpace].isDark ? 'dark' : 'light';
  }, [readingSpace]);

  const value = useMemo(
    () => ({ readingSpace, setReadingSpace, space: READING_SPACES[readingSpace] }),
    [readingSpace],
  );

  return <ReadingSpaceContext.Provider value={value}>{children}</ReadingSpaceContext.Provider>;
}

export function useReadingSpace() {
  const ctx = useContext(ReadingSpaceContext);
  if (!ctx) throw new Error('useReadingSpace must be used within a ReadingSpaceProvider');
  return ctx;
}
