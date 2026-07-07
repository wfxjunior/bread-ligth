import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ReadingTheme, AccentColor, BackgroundTemplate } from '@/constants/colors';

const THEME_KEY    = '@bibliaeN:readingTheme';
const ACCENT_KEY   = '@bibliaeN:accentColor';
const BG_TMPL_KEY  = '@bibliaeN:bgTemplate';

const VALID_THEMES:     ReadingTheme[]       = ['classic', 'oxford', 'scholar', 'night', 'notebook', 'sepia'];
const VALID_ACCENTS:    AccentColor[]        = ['royal-blue', 'burgundy', 'forest', 'slate', 'violet'];
const VALID_TEMPLATES:  BackgroundTemplate[] = ['none', 'golf', 'soccer', 'business', 'sky', 'forest', 'sunset', 'car'];

interface ThemeCtx {
  readingTheme:          ReadingTheme;
  setReadingTheme:       (t: ReadingTheme) => void;
  accentColor:           AccentColor;
  setAccentColor:        (c: AccentColor) => void;
  backgroundTemplate:    BackgroundTemplate;
  setBackgroundTemplate: (t: BackgroundTemplate) => void;
  isDark:                boolean;
}

const ThemeContext = createContext<ThemeCtx>({
  readingTheme:          'classic',
  setReadingTheme:       () => {},
  accentColor:           'burgundy',
  setAccentColor:        () => {},
  backgroundTemplate:    'none',
  setBackgroundTemplate: () => {},
  isDark:                false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [readingTheme,       setReadingThemeState]       = useState<ReadingTheme>('classic');
  const [accentColor,        setAccentColorState]        = useState<AccentColor>('burgundy');
  const [backgroundTemplate, setBackgroundTemplateState] = useState<BackgroundTemplate>('none');

  useEffect(() => {
    AsyncStorage.multiGet([THEME_KEY, ACCENT_KEY, BG_TMPL_KEY])
      .then(([[, t], [, a], [, bg]]) => {
        if (t  && VALID_THEMES.includes(t   as ReadingTheme))      setReadingThemeState(t as ReadingTheme);
        if (a  && VALID_ACCENTS.includes(a  as AccentColor))       setAccentColorState(a as AccentColor);
        if (bg && VALID_TEMPLATES.includes(bg as BackgroundTemplate)) setBackgroundTemplateState(bg as BackgroundTemplate);
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

  const setBackgroundTemplate = useCallback((t: BackgroundTemplate) => {
    setBackgroundTemplateState(t);
    AsyncStorage.setItem(BG_TMPL_KEY, t).catch(() => {});
  }, []);

  const isDark = readingTheme === 'night' || readingTheme === 'sepia';

  return (
    <ThemeContext.Provider value={{
      readingTheme, setReadingTheme,
      accentColor,  setAccentColor,
      backgroundTemplate, setBackgroundTemplate,
      isDark,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
