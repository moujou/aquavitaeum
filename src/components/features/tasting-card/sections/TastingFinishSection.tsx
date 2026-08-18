'use client';

import React from 'react';
import { Spirit } from '@/types/spirit.types';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { FinishTimeIntensityDiagram } from '@/components/features/finish-diagram/FinishTimeIntensityDiagram';
import { TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface TastingFinishSectionProps {
  spirit: Spirit;
  update: <K extends keyof Spirit>(key: K, value: Spirit[K]) => void;
  t: (key: TranslationKey) => string;
}

export function TastingFinishSection({
  spirit,
  update,
  t,
}: TastingFinishSectionProps) {
  return (
    <section className="border-t border-[var(--parchment-divider)] pt-5 flex flex-col gap-5 w-full" aria-label="Finish">
      <FinishTimeIntensityDiagram
        noseFlavorTags={spirit.noseFlavorTags ?? []}
        tasteFlavorTags={spirit.tasteFlavorTags ?? []}
        finishCurves={spirit.finishCurves ?? {}}
        onChangeCurves={(updatedCurves) => update('finishCurves', updatedCurves)}
        selectedFinish={spirit.finish}
        onSelectFinish={(val) => update('finish', val)}
        finishCharacter={spirit.finishCharacter ?? []}
        onChangeFinishCharacter={(chars) => update('finishCharacter', chars)}
      />

      <div className="flex flex-col gap-1.5 pt-2">
        <SectionHeader className="mb-1">{t('finishNotes')}</SectionHeader>
        <textarea
          id="finish-notes-textarea"
          value={spirit.finishNotes ?? ''}
          onChange={(e) => update('finishNotes', e.target.value)}
          rows={3}
          placeholder={t('finishNotesPlaceholder')}
          className={cn(
            'w-full bg-transparent border border-[var(--parchment-border)] rounded-sm p-4',
            'text-sm sm:text-base text-[var(--sepia-text)] font-body placeholder:text-[var(--parchment-border)] leading-relaxed',
            'focus:outline-none focus:border-[var(--sepia-muted)] resize-none transition-colors duration-200',
          )}
        />
      </div>
    </section>
  );
}
