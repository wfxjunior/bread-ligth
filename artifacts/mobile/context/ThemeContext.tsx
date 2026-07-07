import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeCtx {
  themeMode: ThemeMode;
  setThemeMode: (m: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeCtx>({
  themeMode: 'system',
  setThemeMode: () => {},
  isDark: false,
});

const KEY = '@bibliaeN:theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const sys = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then(v => { if (v === 'light' || v === 'dark' || v === 'system') setModeState(v as ThemeMode); })
      .catch(() => {});
  }, []);

  const setThemeMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && sys === 'dark');

  return (
    <ThemeContext.Provider value={{ themeMode: mode, setThemeMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
