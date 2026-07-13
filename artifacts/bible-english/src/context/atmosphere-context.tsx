import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ACCENTS,
  ACCENT_STORAGE_KEY,
  ATMOSPHERES,
  ATMOSPHERE_STORAGE_KEY,
  DEFAULT_ACCENT,
  DEFAULT_ATMOSPHERE,
  buildAtmosphereCssVars,
  type AccentColor,
  type Atmosphere,
} from '../lib/atmospheres';

interface AtmosphereContextValue {
  atmosphere: Atmosphere;
  setAtmosphere: (id: Atmosphere) => void;
  accentColor: AccentColor;
  setAccentColor: (id: AccentColor) => void;
  isDark: boolean;
}

const AtmosphereContext = createContext<AtmosphereContextValue | null>(null);

function readStoredAtmosphere(): Atmosphere {
  try {
    const v = localStorage.getItem(ATMOSPHERE_STORAGE_KEY);
    if (v && v in ATMOSPHERES) return v as Atmosphere;
  } catch {
    // localStorage unavailable (private mode, SSR) — fall back to default.
  }
  return DEFAULT_ATMOSPHERE;
}

function readStoredAccent(): AccentColor {
  try {
    const v = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (v && v in ACCENTS) return v as AccentColor;
  } catch {
    // ignore
  }
  return DEFAULT_ACCENT;
}

export function AtmosphereProvider({ children }: { children: React.ReactNode }) {
  const [atmosphere, setAtmosphereState] = useState<Atmosphere>(readStoredAtmosphere);
  const [accentColor, setAccentColorState] = useState<AccentColor>(readStoredAccent);

  const isDark = ATMOSPHERES[atmosphere].isDark;

  // Apply the palette to the document root as CSS custom properties — this
  // overrides the static :root/.dark values in index.css so every page that
  // already consumes bg-background/text-foreground/bg-card/bg-primary etc.
  // re-skins automatically. Also flip the `.dark` class so the handful of
  // dark: utility variants (input backgrounds, destructive borders) engage
  // the same way they would under the stylesheet's own dark mode.
  useEffect(() => {
    const root = document.documentElement;
    const vars = buildAtmosphereCssVars(atmosphere, accentColor);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [atmosphere, accentColor, isDark]);

  const setAtmosphere = (id: Atmosphere) => {
    setAtmosphereState(id);
    try {
      localStorage.setItem(ATMOSPHERE_STORAGE_KEY, id);
    } catch {
      // ignore write failures — the in-memory value still applies this session.
    }
  };

  const setAccentColor = (id: AccentColor) => {
    setAccentColorState(id);
    try {
      localStorage.setItem(ACCENT_STORAGE_KEY, id);
    } catch {
      // ignore
    }
  };

  const value = useMemo(
    () => ({ atmosphere, setAtmosphere, accentColor, setAccentColor, isDark }),
    [atmosphere, accentColor, isDark],
  );

  return <AtmosphereContext.Provider value={value}>{children}</AtmosphereContext.Provider>;
}

export function useAtmosphere() {
  const ctx = useContext(AtmosphereContext);
  if (!ctx) throw new Error('useAtmosphere must be used within an AtmosphereProvider');
  return ctx;
}
