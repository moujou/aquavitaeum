'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language } from '@/lib/i18n/translations';
import { SpiritAnalysisResult } from '@/services/ai-assistant-service';

export type SpiritApplyMode = 'facts-only' | 'full';

interface ScanResultPreviewProps {
  language: Language;
  analysisResult: SpiritAnalysisResult;
  applyMode: SpiritApplyMode;
  onApplyModeChange: (mode: SpiritApplyMode) => void;
}

export function ScanResultPreview({
  language,
  analysisResult,
  applyMode,
  onApplyModeChange,
}: ScanResultPreviewProps) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in flex-1 justify-between">
      {/* Header Badge */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] flex flex-col gap-4 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--forest-green)] bg-[var(--forest-green)]/10 px-2.5 py-1 rounded-md border border-[var(--forest-green)]/30">
              {analysisResult.spiritType}
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-2 leading-snug">
              {analysisResult.name}
            </h3>
            <p className="font-body text-sm text-[var(--sepia-muted)] mt-1">
              {analysisResult.distillery}
              {analysisResult.region ? ` • ${analysisResult.region}` : ''}
            </p>
          </div>
          <div className="bg-[var(--forest-green)]/15 border border-[var(--forest-green)]/35 text-[var(--forest-green)] px-4 py-2 rounded-xl text-sm font-mono font-bold shrink-0 text-center shadow-2xs">
            {analysisResult.abv}% vol
          </div>
        </div>

        {/* Detected Badges Grid */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-[var(--parchment-border)]/50 text-xs sm:text-sm">
          {analysisResult.volumeMl && (
            <span className="bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] px-3 py-1 rounded-lg text-[var(--sepia-text)] font-mono">
              🧴 {analysisResult.volumeMl} ml
            </span>
          )}
          {analysisResult.age && (
            <span className="bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] px-3 py-1 rounded-lg text-[var(--sepia-text)] font-mono">
              {analysisResult.age} {language === 'DE' ? 'Jahre' : 'Years'}
            </span>
          )}
          {analysisResult.caskTypes?.map((cask, i) => (
            <span
              key={i}
              className="bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] px-3 py-1 rounded-lg text-[var(--sepia-text)] font-body"
            >
              🪵 {cask}
            </span>
          ))}
          {analysisResult.characteristics?.map((char, i) => (
            <span
              key={i}
              className="bg-[var(--forest-green)]/10 border border-[var(--forest-green)]/25 px-3 py-1 rounded-lg text-[var(--forest-green)] font-body font-medium"
            >
              ✓ {char}
            </span>
          ))}
          {analysisResult.colour && (
            <span className="bg-[var(--brass-accent)]/10 border border-[var(--brass-accent)]/25 px-3 py-1 rounded-lg text-[var(--brass-accent)] font-body">
              🎨 {analysisResult.colour}
            </span>
          )}
        </div>
      </div>

      {/* Mode Selection Options (2-Column Grid on larger screens) */}
      <div className="flex flex-col gap-3">
        <label className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--sepia-text)]">
          {language === 'DE' ? 'Übernahme-Modus wählen' : 'Select Apply Mode'}
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Option 1: Facts-Only (Recommended) */}
          <button
            type="button"
            onClick={() => onApplyModeChange('facts-only')}
            className={cn(
              'flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs',
              applyMode === 'facts-only'
                ? 'bg-[var(--forest-green)]/10 border-[var(--forest-green)] ring-1 ring-[var(--forest-green)]/40'
                : 'bg-[var(--pub-bg-panel)] border-[var(--parchment-border)] hover:bg-black/[0.02]'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors',
                applyMode === 'facts-only'
                  ? 'border-[var(--forest-green)] bg-[var(--forest-green)] text-white'
                  : 'border-[var(--parchment-border)] bg-transparent'
              )}
            >
              {applyMode === 'facts-only' && <CheckCircle2 size={15} strokeWidth={3} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm sm:text-base font-bold text-[var(--foreground)]">
                {language === 'DE'
                  ? 'Nur Fakten übernehmen (Empfohlen)'
                  : 'Facts Only (Recommended)'}
              </p>
              <p className="font-body text-xs text-[var(--sepia-muted)] mt-1 leading-relaxed">
                {language === 'DE'
                  ? 'Flaschendaten (Name, ABV, Alter, Fässer, Farbe) werden ausgefüllt. Nase, Gaumen, Finish & Score bleiben frei für dein persönliches Tasting.'
                  : 'Fills bottle specifications (Name, ABV, age, casks, color). Nose, palate, finish & score remain free for your personal tasting.'}
              </p>
            </div>
          </button>

          {/* Option 2: Full Sommelier Draft */}
          <button
            type="button"
            onClick={() => onApplyModeChange('full')}
            className={cn(
              'flex items-start gap-3.5 p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer shadow-2xs',
              applyMode === 'full'
                ? 'bg-[var(--forest-green)]/10 border-[var(--forest-green)] ring-1 ring-[var(--forest-green)]/40'
                : 'bg-[var(--pub-bg-panel)] border-[var(--parchment-border)] hover:bg-black/[0.02]'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition-colors',
                applyMode === 'full'
                  ? 'border-[var(--forest-green)] bg-[var(--forest-green)] text-white'
                  : 'border-[var(--parchment-border)] bg-transparent'
              )}
            >
              {applyMode === 'full' && <CheckCircle2 size={15} strokeWidth={3} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm sm:text-base font-bold text-[var(--foreground)]">
                {language === 'DE'
                  ? 'Mit Destillerie-Notizen'
                  : 'Include Distillery Notes'}
              </p>
              <p className="font-body text-xs text-[var(--sepia-muted)] mt-1 leading-relaxed">
                {language === 'DE'
                  ? 'Füllt zusätzlich offizielle Brennerei-Notizen (Nase, Geschmack, Abgang) und Radar-Tags als Inspiration ein.'
                  : 'Also populates official distillery tasting notes (nose, palate, finish) and radar tags as inspiration.'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
