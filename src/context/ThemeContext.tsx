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
      if (
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        return 'pub-dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const cached = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (cached !== 'pub-dark' && cached !== 'light') {
        setThemeState(e.matches ? 'pub-dark' : 'light');
      }
    };
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDark = theme === 'pub-dark';
      const targetColor = isDark ? '#0D1115' : '#ECE5D8';

      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'pub-dark');
        document.documentElement.style.colorScheme = 'dark';
        document.documentElement.style.backgroundColor = targetColor;
        if (document.body) {
          document.body.setAttribute('data-theme', 'pub-dark');
          document.body.style.colorScheme = 'dark';
          document.body.style.backgroundColor = targetColor;
        }
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.style.colorScheme = 'light dark';
        document.documentElement.style.backgroundColor = targetColor;
        if (document.body) {
          document.body.removeAttribute('data-theme');
          document.body.style.colorScheme = 'light dark';
          document.body.style.backgroundColor = targetColor;
        }
      }

      let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
      if (!colorSchemeMeta) {
        colorSchemeMeta = document.createElement('meta');
        colorSchemeMeta.setAttribute('name', 'color-scheme');
        document.head.appendChild(colorSchemeMeta);
      }
      colorSchemeMeta.setAttribute('content', isDark ? 'dark' : 'light dark');

      const metas = document.querySelectorAll('meta[name="theme-color"]');
      if (metas.length > 0) {
        metas.forEach((meta) => {
          meta.setAttribute('content', targetColor);
        });
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        meta.setAttribute('id', 'av-theme-color');
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
