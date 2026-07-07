import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReadingTheme, AccentColor } from '@/constants/colors';

const THEME_KEY  = '@bibliaeN:readingTheme';
const ACCENT_KEY = '@bibliaeN:accentColor';

const VALID_THEMES:  ReadingTheme[] = ['classic', 'oxford', 'scholar', 'night', 'notebook'];
const VALID_ACCENTS: AccentColor[]  = ['royal-blue', 'burgundy', 'forest', 'slate', 'violet', 'amber'];

interface ThemeCtx {
  readingTheme:    ReadingTheme;
  setReadingTheme: (t: ReadingTheme) => void;
  accentColor:     AccentColor;
  setAccentColor:  (c: AccentColor) => void;
  isDark:          boolean;
}

const ThemeContext = createContext<ThemeCtx>({
  readingTheme:    'classic',
  setReadingTheme: () => {},
  accentColor:     'burgundy',
  setAccentColor:  () => {},
  isDark:          false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [readingTheme, setReadingThemeState] = useState<ReadingTheme>('classic');
  const [accentColor,  setAccentColorState]  = useState<AccentColor>('burgundy');

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, ACCENT_KEY])
      .then(([[, t], [, a]]) => {
        if (t && VALID_THEMES.includes(t as ReadingTheme))  setReadingThemeState(t as ReadingTheme);
        if (a && VALID_ACCENTS.includes(a as AccentColor))  setAccentColorState(a as AccentColor);
      })
      .catch(() => {});
  }, []);

  const setReadingTheme = useCallback((t: ReadingTheme) => {
    setReadingThemeState(t);
    AsyncStorage.setItem(THEME_KEY, t).catch(() => {});
  }, []);

  const setAccentColor = useCallback((c: AccentColor) => {
    setAccentColorState(c);
    AsyncStorage.setItem(ACCENT_KEY, c).catch(() => {});
  }, []);

  const isDark = readingTheme === 'night';

  return (
    <ThemeContext.Provider value={{ readingTheme, setReadingTheme, accentColor, setAccentColor, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
