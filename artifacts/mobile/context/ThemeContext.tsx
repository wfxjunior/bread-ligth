import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Atmosphere, AccentColor, ReadingSpace } from '@/constants/colors';
import { getColors, LEGACY_TEMPLATE_TO_SPACE } from '@/constants/colors';

const ATMOSPHERE_KEY = '@bibliaeN:atmosphere';
const ACCENT_KEY      = '@bibliaeN:accentColor';
const SPACE_KEY       = '@bibliaeN:readingSpace';
const LEGACY_BG_KEY   = '@bibliaeN:bgTemplate'; // legacy background-template key — migrated, then cleared

const VALID_ATMOSPHERES: Atmosphere[] = [
  'parchment', 'cozy', 'classic', 'dark', 'night',
  'library', 'morning', 'minimal', 'sepia', 'focus',
];
const VALID_ACCENTS: AccentColor[] = ['royal-blue', 'burgundy', 'forest', 'slate', 'violet'];
const VALID_SPACES:  ReadingSpace[] = ['clean', 'warm', 'cozy', 'nature', 'morning', 'evening', 'classic', 'modern', 'serenity'];

interface ThemeCtx {
  atmosphere:          Atmosphere;
  setAtmosphere:       (t: Atmosphere) => void;
  accentColor:         AccentColor;
  setAccentColor:      (c: AccentColor) => void;
  /** Reading Space — an independent, calm background mood applied to Home,
   *  the Bible reader, and the daily devotional. Orthogonal to Atmosphere. */
  readingSpace:        ReadingSpace;
  setReadingSpace:     (s: ReadingSpace) => void;
  isDark:              boolean;
  /** Opacity driver for the soft cross-fade overlay shown while an atmosphere
   *  switch is in flight — mounted once near the app root. */
  transitionOpacity:   Animated.Value;
  /** Background color to paint under the fade overlay while transitioning. */
  transitionColor:     string;
}

const ThemeContext = createContext<ThemeCtx>({
  atmosphere:        'classic',
  setAtmosphere:     () => {},
  accentColor:       'burgundy',
  setAccentColor:    () => {},
  readingSpace:      'clean',
  setReadingSpace:   () => {},
  isDark:            false,
  transitionOpacity: new Animated.Value(0),
  transitionColor:   '#FAF8F4',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [atmosphere,  setAtmosphereState]  = useState<Atmosphere>('classic');
  const [accentColor, setAccentColorState] = useState<AccentColor>('burgundy');
  const [readingSpace, setReadingSpaceState] = useState<ReadingSpace>('clean');

  const transitionOpacity = useRef(new Animated.Value(0)).current;
  const transitionColorRef = useRef('#FAF8F4');
  const [transitionColor, setTransitionColor] = useState('#FAF8F4');

  useEffect(() => {
    AsyncStorage.multiGet([ATMOSPHERE_KEY, ACCENT_KEY, SPACE_KEY, LEGACY_BG_KEY])
      .then(([[, atm], [, a], [, sp], [, legacyBg]]) => {
        if (atm && VALID_ATMOSPHERES.includes(atm as Atmosphere)) setAtmosphereState(atm as Atmosphere);
        if (a   && VALID_ACCENTS.includes(a as AccentColor))       setAccentColorState(a as AccentColor);

        if (sp && VALID_SPACES.includes(sp as ReadingSpace)) {
          setReadingSpaceState(sp as ReadingSpace);
        } else if (legacyBg) {
          // Migrate a previously-selected background template to a sensible space,
          // then clear the legacy key so this only runs once.
          const migrated = LEGACY_TEMPLATE_TO_SPACE[legacyBg] ?? 'clean';
          setReadingSpaceState(migrated);
          AsyncStorage.setItem(SPACE_KEY, migrated).catch(() => {});
        }
        AsyncStorage.removeItem(LEGACY_BG_KEY).catch(() => {});
      })
      .catch(() => {});
  }, []);

  // Apple Books-style soft fade: briefly veil the screen with the *current*
  // atmosphere's background while the palette swaps underneath, then reveal
  // the new atmosphere by fading the veil back out.
  const runTransition = useCallback((fromBg: string) => {
    transitionColorRef.current = fromBg;
    setTransitionColor(fromBg);
    transitionOpacity.setValue(0);
    Animated.timing(transitionOpacity, { toValue: 1, duration: 130, useNativeDriver: true })
      .start(() => {
        Animated.timing(transitionOpacity, { toValue: 0, duration: 320, useNativeDriver: true }).start();
      });
  }, [transitionOpacity]);

  const setAtmosphere = useCallback((t: Atmosphere) => {
    setAtmosphereState(curr => {
      if (curr !== t) {
        const currentBg = getColors(curr, accentColor).background;
        runTransition(currentBg);
      }
      return t;
    });
    AsyncStorage.setItem(ATMOSPHERE_KEY, t).catch(() => {});
  }, [accentColor, runTransition]);

  const setAccentColor = useCallback((c: AccentColor) => {
    setAccentColorState(c);
    AsyncStorage.setItem(ACCENT_KEY, c).catch(() => {});
  }, []);

  const setReadingSpace = useCallback((s: ReadingSpace) => {
    setReadingSpaceState(s);
    AsyncStorage.setItem(SPACE_KEY, s).catch(() => {});
  }, []);

  const isDark = getColors(atmosphere, accentColor).isDark;

  return (
    <ThemeContext.Provider value={{
      atmosphere, setAtmosphere,
      accentColor, setAccentColor,
      readingSpace, setReadingSpace,
      isDark,
      transitionOpacity,
      transitionColor,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
