import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { LANGS, T, trFor } from '../lib/i18n.js';

const LangContext = createContext(null);

function storedLang() {
  try {
    const l = localStorage.getItem('rb_lang_v1');
    if (l && LANGS.some((x) => x.code === l)) return l;
  } catch (e) { void e; }
  return 'en';
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(storedLang);

  useEffect(() => {
    try { localStorage.setItem('rb_lang_v1', lang); } catch (e) { void e; }
  }, [lang]);

  const value = useMemo(() => ({
    lang,
    setLang,
    tr: (key) => trFor(lang, key),
    resetT: key => trFor(lang, key),
    currentT: T[lang] || T.en,
  }), [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}