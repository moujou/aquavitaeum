'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Language, SUPPORTED_LANGUAGES, TranslationKey, t as translate } from '@/lib/i18n/translations';

const LOCAL_STORAGE_LANG_KEY = 'aquavitaeum_language_setting';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('EN');

  // Hydrate language on startup from /api/settings or localStorage fallback
  useEffect(() => {
    let isMounted = true;

    async function loadLanguageSetting() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          const serverLang = data?.settings?.language;
          if (isMounted && (SUPPORTED_LANGUAGES as readonly string[]).includes(serverLang)) {
            setLanguageState(serverLang as Language);
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(LOCAL_STORAGE_LANG_KEY, serverLang);
            }
            return;
          }
        }
      } catch {
        // Fallback to local storage
      }

      if (typeof window !== 'undefined') {
        const cached = window.localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
        if (isMounted && (SUPPORTED_LANGUAGES as readonly string[]).includes(cached ?? '')) {
          setLanguageState(cached as Language);
        }
      }
    }

    loadLanguageSetting();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync HTML lang attribute for screen readers, CSS :lang(), and spellcheck
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language.toLowerCase();
    }
  }, [language]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(LOCAL_STORAGE_LANG_KEY, newLang);
      } catch {
        // Ignore storage quota error
      }
    }

    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: newLang }),
    }).catch(() => {
      // Ignore background network error
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translate(key, language),
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
