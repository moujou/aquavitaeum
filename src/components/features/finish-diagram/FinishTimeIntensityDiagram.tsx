'use client';

import React, { useState } from 'react';
import {
  FinishCurveParams,
  SPIRIT_FINISH_DURATIONS,
  SPIRIT_FINISH_CHARACTERS,
} from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { translateFinishCharacter } from '@/lib/i18n/translations';
import { translateFlavorTag, getFlavorColor } from '@/data/spirit-flavor-taxonomy';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Component Props ─────────────────────────────────────────────────────────

interface FinishTimeIntensityDiagramProps {
  noseFlavorTags?: string[];
  tasteFlavorTags?: string[];
  finishCurves?: Record<string, FinishCurveParams>;
  onChangeCurves?: (curves: Record<string, FinishCurveParams>) => void;
  selectedFinish?: string;
  onSelectFinish?: (finish: string) => void;
  finishCharacter?: string[];
  onChangeFinishCharacter?: (chars: string[]) => void;
  className?: string;
}

export function FinishTimeIntensityDiagram({
  noseFlavorTags = [],
  tasteFlavorTags = [],
  finishCurves = {},
  onChangeCurves,
  selectedFinish = 'Medium',
  onSelectFinish,
  finishCharacter = [],
  onChangeFinishCharacter,
  className,
}: FinishTimeIntensityDiagramProps) {
  const { language, t } = useLanguage();

  const activeTags = Array.from(
    new Set([...noseFlavorTags, ...tasteFlavorTags])
  );

  const [isAddingCustomChar, setIsAddingCustomChar] = useState(false);
  const [customCharInput, setCustomCharInput] = useState('');

  const handleToggleFinishChar = (char: string) => {
    if (!onChangeFinishCharacter) return;
    const exists = finishCharacter.includes(char);
    if (exists) {
      onChangeFinishCharacter(finishCharacter.filter((c) => c !== char));
    } else {
      onChangeFinishCharacter([...finishCharacter, char]);
    }
  };

  const handleAddCustomChar = () => {
    const trimmed = customCharInput.trim();
    if (trimmed && !finishCharacter.includes(trimmed)) {
      onChangeFinishCharacter?.([...finishCharacter, trimmed]);
    }
    setCustomCharInput('');
    setIsAddingCustomChar(false);
  };

  const handleToggleLingeringTag = (tag: string) => {
    if (!onChangeCurves) return;
    const curve = finishCurves[tag];
    const isCurrentlyProminent = (curve?.peakIntensity ?? 7) >= 6;
    const nextIntensity = isCurrentlyProminent ? 3 : 8;

    onChangeCurves({
      ...finishCurves,
      [tag]: {
        startTime: curve?.startTime ?? 0,
        peakTime: curve?.peakTime ?? 8,
        endTime: curve?.endTime ?? 30,
        peakIntensity: nextIntensity,
      },
    });
  };

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1.5">
        <SectionHeader className="mb-0">
          {t('finishTimeIntensityDiagram')}
        </SectionHeader>
      </div>

      {/* 1. Abgangslänge (Persistence Scale) - Compact Single-Row Layout */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-display uppercase tracking-wider font-bold text-[var(--sepia-muted)]">
          {t('finishLength')}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SPIRIT_FINISH_DURATIONS.map((dur) => {
            const isSelected = selectedFinish === dur;
            const label =
              dur === 'Short'
                ? (language === 'DE' ? 'Kurz' : 'Short')
                : dur === 'Medium'
                ? (language === 'DE' ? 'Mittel' : 'Medium')
                : dur === 'Long'
                ? (language === 'DE' ? 'Lang' : 'Long')
                : (language === 'DE' ? 'Sehr lang' : 'Very Long');

            const durationText =
              dur === 'Short'
                ? '< 15s'
                : dur === 'Medium'
                ? '15–45s'
                : dur === 'Long'
                ? '45–90s'
                : '> 90s';

            return (
              <button
                key={dur}
                type="button"
                id={`finish-btn-${dur.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => onSelectFinish?.(dur)}
                className={cn(
                  'px-3 py-2 rounded-lg border text-left transition-all duration-150 flex items-center justify-between gap-1.5 cursor-pointer select-none min-h-[38px]',
                  isSelected
                    ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-xs'
                    : 'border-[var(--parchment-border)] bg-[var(--parchment-bg-alt)]/60 text-[var(--foreground)] hover:bg-[var(--parchment-bg-alt)] hover:border-[var(--brass-accent)]'
                )}
                aria-pressed={isSelected}
              >
                <span className={cn('text-xs sm:text-[13px] font-body font-bold truncate', isSelected ? 'text-white' : 'text-[var(--foreground)]')}>
                  {label}
                </span>
                <span
                  className={cn(
                    'text-xs sm:text-[13px] font-mono shrink-0 whitespace-nowrap font-bold',
                    isSelected ? 'text-white font-extrabold' : 'text-[var(--sepia-muted)]'
                  )}
                >
                  {durationText}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dominante Noten im Nachklang (Lingering Notes) */}
      <div className="p-3.5 rounded-xl bg-[var(--parchment-bg-alt)]/60 border border-[var(--parchment-border)] flex flex-col gap-2 shadow-2xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-display uppercase tracking-wider font-bold text-[var(--sepia-muted)]">
            {t('lingeringNotesTitle')}
          </span>
          <span className="text-[11px] font-body text-[var(--sepia-muted)]">
            {t('lingeringNotesDesc')}
          </span>
        </div>

        {activeTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {activeTags.map((tag) => {
              const color = getFlavorColor(tag);
              const curve = finishCurves[tag];
              const isProminent = (curve?.peakIntensity ?? 7) >= 6;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleLingeringTag(tag)}
                  style={{
                    backgroundColor: isProminent ? color : undefined,
                  }}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-xs sm:text-sm font-bold font-body transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none min-h-[32px]',
                    isProminent
                      ? 'border-transparent text-white shadow-xs scale-[1.02]'
                      : 'border-[var(--parchment-border)] bg-[var(--parchment-bg)] text-[var(--sepia-muted)] hover:border-[var(--brass-accent)]'
                  )}
                  aria-pressed={isProminent}
                >
                  <span
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0 border border-black/20',
                      isProminent && 'bg-white border-white/50'
                    )}
                    style={{ backgroundColor: isProminent ? undefined : color }}
                  />
                  <span>{translateFlavorTag(tag, language)}</span>
                  {isProminent && <Check size={13} className="ml-0.5 text-white" />}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[var(--sepia-muted)] italic font-body py-0.5">
            {language === 'DE'
              ? 'Wähle oben Aromen bei Nase oder Geschmack aus, um sie hier als dominante Nachklang-Noten hervorzuheben.'
              : 'Select aromas under Nose or Taste to highlight them as dominant finish notes.'}
          </p>
        )}
      </div>

      {/* 3. Abgangs-Charakter & Wärme (Sommelier Multi-Chips) */}
      <div className="flex flex-col gap-2 pt-0.5">
        <span className="text-xs font-display uppercase tracking-wider font-bold text-[var(--sepia-muted)]">
          {t('finishCharacterLabel')}
        </span>

        <div className="flex flex-wrap gap-2 items-center">
          {SPIRIT_FINISH_CHARACTERS.map((char) => {
            const isSelected = finishCharacter.includes(char);

            return (
              <button
                key={char}
                type="button"
                onClick={() => handleToggleFinishChar(char)}
                className={cn(
                  'px-3 py-1.5 rounded-full border text-xs sm:text-sm font-medium font-body transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none min-h-[32px]',
                  isSelected
                    ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-xs font-semibold'
                    : 'border-[var(--parchment-border)] bg-[var(--parchment-bg-alt)]/60 text-[var(--foreground)] hover:bg-[var(--parchment-bg-alt)] hover:border-[var(--brass-accent)]'
                )}
                aria-pressed={isSelected}
              >
                {char === 'Warming' && '🔥'}
                {char === 'Sharp' && '⚡'}
                {char === 'Spicy' && '🌶️'}
                {char === 'Alcoholic' && '🥃'}
                {char === 'Peated' && '🪵'}
                {char === 'Smoky' && '💨'}
                {char === 'Oaky' && '🌳'}
                {char === 'Tannic' && '🍂'}
                {char === 'Dry' && '🌵'}
                {char === 'Sweet' && '🍯'}
                {char === 'Mild' && '🌿'}
                {char === 'Saline' && '🌊'}
                {char === 'Mineral' && '🪨'}
                <span>{translateFinishCharacter(char, language)}</span>
                {isSelected && <Check size={12} className="ml-0.5" />}
              </button>
            );
          })}

          {/* Render custom added characters */}
          {finishCharacter
            .filter((c) => !(SPIRIT_FINISH_CHARACTERS as readonly string[]).includes(c))
            .map((customChar) => (
              <div
                key={customChar}
                className="px-3 py-1.5 rounded-full border border-[var(--wood-selection)] bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-semibold font-body shadow-xs flex items-center gap-1.5 min-h-[32px] select-none"
              >
                <span>✨ {customChar}</span>
                <button
                  type="button"
                  onClick={() => handleToggleFinishChar(customChar)}
                  className="ml-1 text-xs opacity-75 hover:opacity-100 hover:text-red-200 cursor-pointer"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}

          {/* Add Custom Finish Character Button / Inline Input */}
          {isAddingCustomChar ? (
            <div className="flex items-center gap-1.5 bg-[var(--parchment-bg)] border border-[var(--wood-selection)] rounded-full px-2 py-0.5 shadow-xs">
              <input
                type="text"
                value={customCharInput}
                onChange={(e) => setCustomCharInput(e.target.value)}
                maxLength={30}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCustomChar();
                  else if (e.key === 'Escape') setIsAddingCustomChar(false);
                }}
                placeholder={language === 'DE' ? 'z.B. Cremig' : 'e.g. Creamy'}
                autoFocus
                className="w-24 text-xs font-body bg-transparent outline-none text-[var(--foreground)] px-1"
              />
              <button
                type="button"
                onClick={handleAddCustomChar}
                className="px-2 py-0.5 rounded-full bg-[var(--wood-selection)] text-white text-[11px] font-bold cursor-pointer hover:scale-105"
              >
                ✓
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCustomChar(false)}
                className="text-xs text-[var(--sepia-muted)] hover:text-[var(--sepia-text)] px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingCustomChar(true)}
              className="px-3 py-1.5 rounded-full border border-dashed border-[var(--parchment-border)] text-xs font-body font-semibold text-[var(--sepia-muted)] hover:text-[var(--sepia-text)] hover:border-[var(--sepia-muted)] transition-all cursor-pointer min-h-[32px] flex items-center gap-1"
            >
              <Plus size={13} />
              <span>{t('addCustomFinishChar')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
