'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { Language, TranslationKey, t as translate } from '@/lib/i18n/translations';

const LOCAL_STORAGE_LANG_KEY = 'aquavitaeum_language_setting';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize state synchronously to prevent first-render language flickering
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      // 1. Check if user already has a saved preference
      const cached = window.localStorage.getItem(LOCAL_STORAGE_LANG_KEY);
      if (cached === 'DE' || cached === 'EN') {
        return cached as Language;
      }
      // 2. If first-time load, fall back to browser's system language
      const browserLang = window.navigator.language;
      if (browserLang.startsWith('de')) {
        return 'DE';
      }
    }
    return 'EN';
  });

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
