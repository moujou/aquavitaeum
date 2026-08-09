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
        'h-7 flex items-center rounded border border-[#C59B27]/40 bg-[var(--wood-accent)] p-0.5 shadow-sm text-[11px] font-display font-semibold select-none',
        className,
      )}
      aria-label="Language selector"
    >
      <button
        id="lang-toggle-de"
        type="button"
        onClick={() => setLanguage('DE')}
        className={cn(
          'px-2 py-0.5 rounded-xs transition-all duration-150 cursor-pointer',
          language === 'DE'
            ? 'bg-[#C59B27] text-[#1A120B] font-bold shadow-xs'
            : 'text-[#C59B27]/60 hover:text-[#C59B27]',
        )}
        aria-pressed={language === 'DE'}
      >
        DE
      </button>
      <span className="text-white/20 px-0.5 text-[9px] font-body">|</span>
      <button
        id="lang-toggle-en"
        type="button"
        onClick={() => setLanguage('EN')}
        className={cn(
          'px-2 py-0.5 rounded-xs transition-all duration-150 cursor-pointer',
          language === 'EN'
            ? 'bg-[#C59B27] text-[#1A120B] font-bold shadow-xs'
            : 'text-[#C59B27]/60 hover:text-[#C59B27]',
        )}
        aria-pressed={language === 'EN'}
      >
        EN
      </button>
    </div>
  );
}
