'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { BOOK_SPINE_PALETTES, SpinePalette } from './bookshelf/JournalBookshelfView';

interface JournalColorPickerProps {
  selectedColor?: string;
  onChange: (colorKey: string) => void;
}

export function JournalColorPicker({
  selectedColor = 'green',
  onChange,
}: JournalColorPickerProps) {
  const { t, language } = useLanguage();

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-xs font-body text-[var(--sepia-muted)] tracking-wider">
        {t('bookColorLabel')}
      </label>
      <div className="flex items-center gap-2.5 flex-wrap">
        {BOOK_SPINE_PALETTES.map((palette: SpinePalette) => {
          const isSelected = selectedColor === palette.key;
          const colorName = language === 'DE' ? palette.nameDE : palette.nameEN;

          return (
            <button
              key={palette.key}
              type="button"
              onClick={() => onChange(palette.key)}
              title={colorName}
              aria-label={colorName}
              style={{ backgroundColor: palette.hex }}
              className={cn(
                'w-8 h-8 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center relative select-none shrink-0 shadow-xs',
                palette.foilBorder,
                isSelected
                  ? 'ring-2 ring-[var(--brass-accent)] scale-110 shadow-md border-amber-300'
                  : 'hover:scale-105 opacity-90 hover:opacity-100 border-black/30',
              )}
            >
              {isSelected && (
                <Check className="w-4 h-4 text-amber-200 stroke-[3] drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
