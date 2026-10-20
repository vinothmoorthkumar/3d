import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getContent, type Content, type Lang } from './data/content';

type LanguageState = { lang: Lang; setLang: (lang: Lang) => void; c: Content };

const LanguageContext = createContext<LanguageState | null>(null);
const STORAGE_KEY = 'un-careers-language';

/** Same convention as careers.un.org: ?language=en|fr, then the visitor's last choice. */
function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('language');
  if (fromUrl === 'en' || fromUrl === 'fr') return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    /* storage unavailable */
  }
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable */
    }
    const url = new URL(window.location.href);
    url.searchParams.set('language', next);
    window.history.replaceState(null, '', url);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, c: getContent(lang) }), [lang, setLang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components -- hook belongs with its provider
export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}
