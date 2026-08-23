'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { Language } from '@/lib/i18n/translations';

interface ScanSearchTabProps {
  language: Language;
  textQuery: string;
  onQueryChange: (query: string) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

const EXAMPLE_QUERIES = [
  'Miltonduff 14 Signatory',
  'Ardbeg Uigeadail',
  'Springbank 10',
  'Lagavulin 16',
  'Macallan 12 Sherry Oak',
];

export function ScanSearchTab({
  language,
  textQuery,
  onQueryChange,
  onSubmit,
}: ScanSearchTabProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col justify-between flex-1 gap-4 w-full py-1 animate-fade-in">
      <div className="flex flex-col gap-3">
        <label
          htmlFor="spirit-text-query"
          className="font-display text-xs sm:text-sm font-bold text-[var(--sepia-text)]"
        >
          {language === 'DE' ? 'Name der Brennerei & Abfüllung' : 'Distillery & Bottling Name'}
        </label>
        <div className="relative flex items-center bg-[var(--parchment-bg)] border-[1.5px] border-[var(--forest-green)]/45 focus-within:border-[var(--forest-green)] rounded-full px-5 h-12 transition-all duration-200 shadow-xs focus-within:shadow-[0_2px_14px_rgba(46,148,93,0.20)]">
          <Search size={18} className="text-[var(--forest-green)] mr-3 flex-shrink-0" />
          <input
            id="spirit-text-query"
            type="text"
            value={textQuery}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={
              language === 'DE'
                ? 'z. B. Miltonduff 14 Signatory 100 Proof, Ardbeg Uigeadail, Springbank 10...'
                : 'e.g. Miltonduff 14 Signatory 100 Proof, Ardbeg Uigeadail, Springbank 10...'
            }
            className="w-full bg-transparent text-sm sm:text-base text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/50 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            data-testid="spirit-search-submit-btn"
            disabled={!textQuery.trim()}
            className="ml-2 px-4 py-2 rounded-full bg-[var(--wood-dark)] text-white hover:bg-[var(--wood-accent)] transition-all font-semibold text-xs sm:text-sm shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {language === 'DE' ? 'Suchen' : 'Search'}
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-display uppercase tracking-wider text-[var(--sepia-muted)] mr-1">
            {language === 'DE' ? 'Beispiele:' : 'Examples:'}
          </span>
          {EXAMPLE_QUERIES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => onQueryChange(example)}
              className="px-2.5 py-1 rounded-full bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] hover:border-[var(--forest-green)] text-[11px] text-[var(--sepia-text)] transition-all cursor-pointer hover:bg-black/5"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Sommelier Tip for Independent Bottlers */}
      <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] text-xs text-[var(--sepia-text)] shadow-xs">
        <span className="text-amber-500 font-bold shrink-0">⭐ {language === 'DE' ? 'Tipp:' : 'Tip:'}</span>
        <span>
          {language === 'DE'
            ? 'Ideal für unabhängige Abfüller (Signatory, Gordon & MacPhail, Cadenhead etc.), Sondereditionen und Destillerie-Klassiker.'
            : 'Ideal for independent bottlers (Signatory, Gordon & MacPhail, Cadenhead etc.), special releases, and distillery classics.'}
        </span>
      </div>
    </form>
  );
}
