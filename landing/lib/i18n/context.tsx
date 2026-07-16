"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { en, type Dict } from "./en";
import { pt } from "./pt";
import { defaultLocale, STORAGE_KEY, type Locale } from "./config";
import { track } from "@/lib/analytics";

const DICTS: Record<Locale, Dict> = { en, pt };

interface I18nValue {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Restore the persisted choice on mount (client-only, avoids hydration flash
  // by keeping the server/default render as `defaultLocale`).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      if (saved && saved in DICTS) {
        setLocaleState(saved);
      } else if (navigator.language?.toLowerCase().startsWith("pt")) {
        setLocaleState("pt");
      }
    } catch {
      /* localStorage unavailable — keep default */
    }
  }, []);

  // Reflect the active locale on <html lang> and localize the document title /
  // meta description at runtime (SSR keeps the English default for crawlers).
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = DICTS[locale].meta.title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", DICTS[locale].meta.description);
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    track("language_change", { locale: l });
  }, []);

  return (
    <I18nContext.Provider value={{ locale, t: DICTS[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
