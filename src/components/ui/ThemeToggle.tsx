'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <div
      id="theme-toggle"
      className={cn(
        'bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] rounded-lg p-0.5 flex gap-0.5 select-none',
        className,
      )}
      aria-label="Theme selector"
    >
      <button
        id="theme-toggle-light"
        type="button"
        onClick={() => setTheme('light')}
        className={cn(
          'p-2 rounded-md transition-all duration-150 cursor-pointer flex items-center justify-center',
          theme === 'light'
            ? 'bg-[var(--wood-selection)] text-[var(--fab-text)] shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5',
        )}
        aria-pressed={theme === 'light'}
        aria-label={t('themeLight')}
        title={t('themeLight')}
      >
        <Sun size={16} />
      </button>

      <button
        id="theme-toggle-dark"
        type="button"
        onClick={() => setTheme('pub-dark')}
        className={cn(
          'p-2 rounded-md transition-all duration-150 cursor-pointer flex items-center justify-center',
          theme === 'pub-dark'
            ? 'bg-[var(--wood-selection)] text-[var(--fab-text)] shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5',
        )}
        aria-pressed={theme === 'pub-dark'}
        aria-label={t('themeDark')}
        title={t('themeDark')}
      >
        <Moon size={16} />
      </button>
    </div>
  );
}
