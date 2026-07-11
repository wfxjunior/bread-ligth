import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Atmosphere, AccentColor } from '@/constants/colors';
import { getColors } from '@/constants/colors';

const ATMOSPHERE_KEY = '@bibliaeN:atmosphere';
const ACCENT_KEY      = '@bibliaeN:accentColor';

const VALID_ATMOSPHERES: Atmosphere[] = [
  'parchment', 'cozy', 'classic', 'dark', 'night',
  'library', 'morning', 'minimal', 'sepia', 'focus',
];
const VALID_ACCENTS: AccentColor[] = ['royal-blue', 'burgundy', 'forest', 'slate', 'violet'];

interface ThemeCtx {
  atmosphere:          Atmosphere;
  setAtmosphere:       (t: Atmosphere) => void;
  accentColor:         AccentColor;
  setAccentColor:      (c: AccentColor) => void;
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
  isDark:            false,
  transitionOpacity: new Animated.Value(0),
  transitionColor:   '#FAF8F4',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [atmosphere,  setAtmosphereState]  = useState<Atmosphere>('classic');
  const [accentColor, setAccentColorState] = useState<AccentColor>('burgundy');

  const transitionOpacity = useRef(new Animated.Value(0)).current;
  const transitionColorRef = useRef('#FAF8F4');
  const [transitionColor, setTransitionColor] = useState('#FAF8F4');

  useEffect(() => {
    AsyncStorage.multiGet([ATMOSPHERE_KEY, ACCENT_KEY])
      .then(([[, atm], [, a]]) => {
        if (atm && VALID_ATMOSPHERES.includes(atm as Atmosphere)) setAtmosphereState(atm as Atmosphere);
        if (a   && VALID_ACCENTS.includes(a as AccentColor))       setAccentColorState(a as AccentColor);
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

  const isDark = getColors(atmosphere, accentColor).isDark;

  return (
    <ThemeContext.Provider value={{
      atmosphere, setAtmosphere,
      accentColor, setAccentColor,
      isDark,
      transitionOpacity,
      transitionColor,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
