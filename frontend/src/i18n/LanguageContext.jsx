import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

export const LANGS = ['bg', 'en', 'ru'];
export const LANG_LABELS = { bg: 'БГ', en: 'EN', ru: 'RU' };
const DEFAULT_LANG = 'bg';
const STORAGE_KEY = 'app_lang';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(saved) ? saved : DEFAULT_LANG;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    // t(key)            -> преведен низ
    // t(key, { n: 3 })  -> замества {n} в низа
    const t = (key, params) => {
      const entry = translations[key];
      let str = entry ? entry[lang] ?? entry[DEFAULT_LANG] ?? key : key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        }
      }
      return str;
    };
    return { lang, setLang, t };
  }, [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}

export function useT() {
  return useLanguage().t;
}
