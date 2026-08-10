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
        'h-7 flex items-center rounded border border-[#E8D5B7]/30 bg-[#311e15]/60 p-0.5 shadow-sm text-[11px] font-display font-semibold select-none',
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
            ? 'bg-[#E8D5B7] text-[#311e15] font-bold shadow-xs'
            : 'text-[#E8D5B7]/60 hover:text-[#E8D5B7]',
        )}
        aria-pressed={language === 'DE'}
      >
        DE
      </button>
      <span className="text-[#E8D5B7]/20 px-0.5 text-[9px] font-body">|</span>
      <button
        id="lang-toggle-en"
        type="button"
        onClick={() => setLanguage('EN')}
        className={cn(
          'px-2 py-0.5 rounded-xs transition-all duration-150 cursor-pointer',
          language === 'EN'
            ? 'bg-[#E8D5B7] text-[#311e15] font-bold shadow-xs'
            : 'text-[#E8D5B7]/60 hover:text-[#E8D5B7]',
        )}
        aria-pressed={language === 'EN'}
      >
        EN
      </button>
    </div>
  );
}
