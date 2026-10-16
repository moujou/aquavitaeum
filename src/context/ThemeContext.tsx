'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type Theme = 'light' | 'pub-dark';

export const THEME_STORAGE_KEY = 'av-theme';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const cached = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (cached === 'pub-dark' || cached === 'light') {
        return cached;
      }
      const domTheme = document.documentElement.getAttribute('data-theme');
      if (domTheme === 'pub-dark' || domTheme === 'light') {
        return domTheme;
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDark = theme === 'pub-dark';
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'pub-dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      const targetColor = isDark ? '#0D1115' : '#ECE5D8';
      const metas = document.querySelectorAll('meta[name="theme-color"]');
      if (metas.length > 0) {
        metas.forEach((meta) => meta.setAttribute('content', targetColor));
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        meta.setAttribute('content', targetColor);
        document.head.appendChild(meta);
      }
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // Ignore storage quota error
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === 'pub-dark' ? 'light' : 'pub-dark';
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch {
          // Ignore storage quota error
        }
      }
      return nextTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
