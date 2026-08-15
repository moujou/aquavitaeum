'use client';

import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      id="language-toggle"
      className={cn(
        'bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] rounded-lg p-0.5 flex gap-0.5 select-none',
        className,
      )}
      aria-label="Language selector"
    >
      <button
        id="lang-toggle-de"
        type="button"
        onClick={() => setLanguage('DE')}
        className={cn(
          'px-2.5 py-1 min-w-[34px] flex items-center justify-center rounded-md font-display font-bold text-xs transition-all duration-150 cursor-pointer',
          language === 'DE'
            ? 'bg-[var(--brass-accent)] text-[var(--parchment-bg)] font-bold shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5',
        )}
        aria-pressed={language === 'DE'}
      >
        DE
      </button>
      <button
        id="lang-toggle-en"
        type="button"
        onClick={() => setLanguage('EN')}
        className={cn(
          'px-2.5 py-1 min-w-[34px] flex items-center justify-center rounded-md font-display font-bold text-xs transition-all duration-150 cursor-pointer',
          language === 'EN'
            ? 'bg-[var(--brass-accent)] text-[var(--parchment-bg)] font-bold shadow-xs'
            : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5',
        )}
        aria-pressed={language === 'EN'}
      >
        EN
      </button>
    </div>
  );
}
