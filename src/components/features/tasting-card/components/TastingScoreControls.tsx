'use client';

import React from 'react';
import { RotateCcw, CheckCircle, Trash2 } from 'lucide-react';
import { Spirit } from '@/types/spirit.types';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { RatingStars } from '@/components/ui/RatingStars';
import { FinishTimeIntensityDiagram } from '@/components/features/finish-diagram/FinishTimeIntensityDiagram';
import { TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface TastingScoreControlsProps {
  spirit: Spirit;
  stars: number;
  saved: boolean;
  finishViewMode: 'simple' | 'advanced';
  setFinishViewMode: (mode: 'simple' | 'advanced') => void;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  handleSave: () => void;
  handleReset: () => void;
  onDelete?: (id: string) => void;
  setShowDeleteModal: (show: boolean) => void;
  t: (key: TranslationKey) => string;
}

export function TastingScoreControls({
  spirit,
  stars,
  saved,
  finishViewMode,
  setFinishViewMode,
  update,
  handleSave,
  handleReset,
  onDelete,
  setShowDeleteModal,
  t,
}: TastingScoreControlsProps) {
  return (
    <>
      {/* ── Full-Width Section 2: Interactive Finish Time-Intensity Diagram & Notes ───────────── */}
      <section className="border-t border-[#D4C3A3] pt-5 flex flex-col gap-5 w-full" aria-label="Finish">
        <FinishTimeIntensityDiagram
          noseFlavorTags={spirit.noseFlavorTags ?? []}
          tasteFlavorTags={spirit.tasteFlavorTags ?? []}
          noseTagIntensities={spirit.noseTagIntensities ?? {}}
          tasteTagIntensities={spirit.tasteTagIntensities ?? {}}
          finishCurves={spirit.finishCurves ?? {}}
          onChangeCurves={(updatedCurves) => update('finishCurves', updatedCurves)}
          viewMode={finishViewMode}
          onViewModeChange={setFinishViewMode}
          selectedFinish={spirit.finish}
          onSelectFinish={(val) => update('finish', val)}
        />

        <div className="flex flex-col gap-1.5 pt-2">
          <FieldLabel htmlFor="finish-notes-textarea">{t('finishNotes')}</FieldLabel>
          <textarea
            id="finish-notes-textarea"
            value={spirit.finishNotes}
            onChange={(e) => update('finishNotes', e.target.value)}
            rows={3}
            placeholder={t('finishNotesPlaceholder')}
            className={cn(
              'w-full bg-transparent border border-[#C4A87A] rounded-sm p-4',
              'text-sm sm:text-base text-[#1A120B] font-body placeholder:text-[#c4a87a] leading-relaxed',
              'focus:outline-none focus:border-[#5c3d22] resize-none transition-colors duration-200',
            )}
          />
        </div>
      </section>

      {/* ── Full-Width Section 3: Score & Rating Section ──── */}
      <section className="border-t border-[#D4C3A3] pt-5 flex flex-col gap-4 w-full" aria-label="Score & Rating Section">
        <FieldLabel>{t('scoreRatingSection')}</FieldLabel>
        <div className="bg-[#1A120B]/5 p-5 rounded border border-[#C4A87A]/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Rating Score & Enlarged Stars */}
          <div className="flex items-center gap-5 w-full sm:w-auto">
            <span className="font-display text-4xl sm:text-5xl font-bold text-[#1A120B] leading-none">
              {spirit.rating100}
            </span>
            <div className="flex flex-col gap-1 flex-1 sm:flex-none">
              <RatingStars stars={stars} size={28} />
            </div>
          </div>

          {/* Rating Slider */}
          <div className="flex-1 max-w-md w-full flex items-center gap-3">
            <span className="text-xs sm:text-sm text-[#755030] font-body font-semibold">1</span>
            <input
              id="rating-slider"
              type="range"
              min={1}
              max={100}
              value={spirit.rating100}
              onChange={(e) => update('rating100', Number(e.target.value))}
              className="flex-1 accent-[#C59B27] h-2.5 cursor-pointer"
              aria-label="Rating score"
            />
            <span className="text-xs sm:text-sm text-[#755030] font-body font-semibold">100</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3.5 justify-end items-center">
          {onDelete && (
            <button
              id="tasting-card-delete"
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-sm border border-red-900/60 bg-red-950/20',
                'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold text-red-900 hover:bg-red-900 hover:text-white transition-colors duration-200 cursor-pointer',
              )}
            >
              <Trash2 size={15} />
              {t('deleteTastingNote')}
            </button>
          )}
          <button
            id="tasting-card-reset"
            type="button"
            onClick={handleReset}
            className={cn(
              'flex items-center gap-2 px-5 py-3 rounded-sm border border-[#C4A87A]',
              'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold text-[#5c3d22] hover:bg-[var(--wood-accent)] hover:text-[#F5EEDC] hover:border-[var(--wood-accent)] transition-colors duration-200 cursor-pointer',
            )}
          >
            <RotateCcw size={15} />
            {t('reset')}
          </button>
          <button
            id="tasting-card-save"
            type="button"
            onClick={handleSave}
            className={cn(
              'min-w-[140px] flex items-center justify-center gap-2 px-6 py-3 rounded-sm border',
              'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer',
              saved
                ? 'bg-green-800 text-white border-green-800'
                : 'bg-[var(--wood-accent)] text-[#F5EEDC] border-[#C59B27] hover:bg-[var(--wood-light)] hover:border-[#e8c247]',
            )}
          >
            <CheckCircle size={15} />
            {saved ? t('saved') : t('saveTastingNote')}
          </button>
        </div>
      </section>
    </>
  );
}
