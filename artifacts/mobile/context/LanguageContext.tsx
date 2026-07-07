import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t as translate, type Lang, type I18nKey } from '@/constants/i18n';

const LANG_KEY = '@breadlight:lang';

interface LanguageCtx {
  lang:    Lang;
  setLang: (l: Lang) => void;
  t:       (key: I18nKey) => string;
}

const LanguageContext = createContext<LanguageCtx>({
  lang:    'pt',
  setLang: () => {},
  t:       (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('pt');

  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY)
      .then(v => { if (v === 'pt' || v === 'en') setLangState(v as Lang); })
      .catch(() => {});
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(LANG_KEY, l).catch(() => {});
  }, []);

  const tFn = useCallback((key: I18nKey) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: tFn }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
