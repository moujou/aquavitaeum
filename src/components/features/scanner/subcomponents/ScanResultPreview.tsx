'use client';

import React from 'react';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Language, t, translateCharacteristic, translateColour } from '@/lib/i18n/translations';
import { translateFlavorTag, resolveSmartCatalogAroma } from '@/data/spirit-flavor-taxonomy';
import { formatSpiritProvenance } from '@/lib/spirit-utils';
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
  // Compute any genuinely new aromas that will be added to the user's Aroma Catalog when 'full' mode is applied
  const newCatalogAromas = React.useMemo(() => {
    const allSuggested = Array.from(
      new Set([
        ...(analysisResult.suggestedNoseTags ?? []),
        ...(analysisResult.suggestedTasteTags ?? []),
      ])
    );
    return allSuggested
      .map((tag) => {
        const preferredDim =
          analysisResult.suggestedNoseTagDimensions?.[tag] ??
          analysisResult.suggestedTasteTagDimensions?.[tag];
        return resolveSmartCatalogAroma(tag, language, preferredDim);
      })
      .filter((res) => res.isNew);
  }, [analysisResult, language]);

  return (
    <div className="flex flex-col gap-6 animate-fade-in flex-1 justify-between">
      {/* Header Badge */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] flex flex-col gap-4 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="text-xs font-mono font-semibold tracking-wide text-[var(--forest-green)] bg-[var(--forest-green)]/10 px-2.5 py-1 rounded-md border border-[var(--forest-green)]/30">
              {analysisResult.spiritType}
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold text-[var(--foreground)] mt-2 leading-snug">
              {analysisResult.name}
            </h3>
            <p className="font-body text-sm text-[var(--sepia-muted)] mt-1">
              {formatSpiritProvenance(analysisResult)}
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
          {analysisResult.caskNo && (
            <span className="bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] px-3 py-1 rounded-lg text-[var(--sepia-text)] font-mono">
              🏷️ {analysisResult.caskNo}
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
              ✓ {translateCharacteristic(char, language)}
            </span>
          ))}
          {analysisResult.colour && (
            <span className="bg-[var(--brass-accent)]/10 border border-[var(--brass-accent)]/25 px-3 py-1 rounded-lg text-[var(--brass-accent)] font-body">
              🎨 {translateColour(analysisResult.colour, language)}
            </span>
          )}
        </div>
      </div>

      {/* Mode Selection Options (2-Column Grid on larger screens) */}
      <div className="flex flex-col gap-3">
        <label className="font-display text-xs sm:text-sm font-semibold tracking-wide text-[var(--sepia-text)]">
          {t('applyModeSelect', language)}
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
                {t('applyModeFactsOnlyTitle', language)}
              </p>
              <p className="font-body text-xs text-[var(--sepia-muted)] mt-1 leading-relaxed">
                {t('applyModeFactsOnlyDesc', language)}
              </p>
            </div>
          </button>

          {/* Option 2: Full Tasting Notes Draft */}
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
                {t('applyModeFullTitle', language)}
              </p>
              <p className="font-body text-xs text-[var(--sepia-muted)] mt-1 leading-relaxed">
                {t('applyModeFullDesc', language)}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Tasting Notes Preview Box when full mode is selected */}
      {applyMode === 'full' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--parchment-bg-alt)]/60 border border-[var(--parchment-border)] flex flex-col gap-3 text-xs sm:text-sm animate-fade-in shadow-2xs">
          <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/60 pb-2">
            <span className="font-display font-semibold tracking-wide text-[var(--sepia-text)]">
              {t('tastingNotesPreviewTitle', language)}
            </span>
            <span className="text-[11px] font-mono text-[var(--sepia-muted)]">
              {t('tastingNotesPreviewSubtitle', language)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Nose Preview */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[var(--parchment-bg)] border border-[var(--parchment-border)]/60">
              <span className="font-display font-semibold text-xs tracking-wide text-[var(--sensory-nose)]">
                👃 {language === 'DE' ? 'Nase' : 'Nose'}
              </span>
              {analysisResult.noseNotes && (
                <p className="font-body text-xs text-[var(--sepia-text)] italic leading-relaxed">
                  &ldquo;{analysisResult.noseNotes}&rdquo;
                </p>
              )}
              {analysisResult.suggestedNoseTags && analysisResult.suggestedNoseTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysisResult.suggestedNoseTags.map((tag) => {
                    const intensity = analysisResult.noseTagIntensities?.[tag] ?? 5;
                    const translated = translateFlavorTag(tag, language);
                    return (
                      <span
                        key={tag}
                        className="bg-[var(--sensory-nose)]/10 text-[var(--sensory-nose)] border border-[var(--sensory-nose)]/25 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      >
                        {translated} <strong className="font-black">({intensity}/10)</strong>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Taste Preview */}
            <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[var(--parchment-bg)] border border-[var(--parchment-border)]/60">
              <span className="font-display font-semibold text-xs tracking-wide text-[var(--sensory-taste)]">
                👅 {language === 'DE' ? 'Geschmack' : 'Taste'}
              </span>
              {analysisResult.tasteNotes && (
                <p className="font-body text-xs text-[var(--sepia-text)] italic leading-relaxed">
                  &ldquo;{analysisResult.tasteNotes}&rdquo;
                </p>
              )}
              {analysisResult.suggestedTasteTags && analysisResult.suggestedTasteTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysisResult.suggestedTasteTags.map((tag) => {
                    const intensity = analysisResult.tasteTagIntensities?.[tag] ?? 5;
                    const translated = translateFlavorTag(tag, language);
                    return (
                      <span
                        key={tag}
                        className="bg-[var(--sensory-taste)]/10 text-[var(--sensory-taste)] border border-[var(--sensory-taste)]/25 px-2 py-0.5 rounded-md text-[11px] font-medium"
                      >
                        {translated} <strong className="font-black">({intensity}/10)</strong>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Finish & Serving Preview */}
          {(analysisResult.finishNotes || analysisResult.servingNotes) && (
            <div className="flex flex-col gap-1 pt-2 border-t border-[var(--parchment-border)]/40 text-xs">
              {analysisResult.finishNotes && (
                <p className="font-body text-xs text-[var(--sepia-text)]">
                  <strong className="font-bold text-[var(--foreground)]">{language === 'DE' ? 'Abgang' : 'Finish'}:</strong> {analysisResult.finishNotes}
                </p>
              )}
              {analysisResult.servingNotes && (
                <p className="font-body text-xs text-[var(--sepia-muted)]">
                  <strong className="font-bold text-[var(--foreground)]">{language === 'DE' ? 'Servierempfehlung' : 'Serving'}:</strong> {analysisResult.servingNotes}
                </p>
              )}
            </div>
          )}

          {/* New Aromas Catalog Destination Notice (Only rendered when genuinely new aromas will be added) */}
          {newCatalogAromas.length > 0 && (
            <div className="flex flex-col gap-2 pt-3 border-t border-[var(--parchment-border)]/60">
              <div className="flex items-center gap-1.5 text-xs font-display font-bold text-[var(--forest-green)]">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {language === 'DE'
                    ? `Neue Aromen für deinen Aromakatalog (${newCatalogAromas.length})`
                    : `New Aromas for your Aroma Catalog (${newCatalogAromas.length})`}
                </span>
              </div>
              <p className="text-[11px] font-body text-[var(--sepia-muted)] leading-snug">
                {language === 'DE'
                  ? 'Diese Aromen existieren noch nicht im Katalog und werden beim Übernehmen automatisch in folgende Kategorien einsortiert:'
                  : 'These aromas are not yet in your catalog and will be automatically filed into the following categories when applied:'}
              </p>
              <div className="flex flex-col gap-1.5">
                {newCatalogAromas.map((item) => {
                  const catName = item.targetCategory.name[language] ?? item.targetCategory.name.EN;
                  const subName = item.targetSubcategory
                    ? `${item.targetSubcategory.emoji || '📁'} ${item.targetSubcategory.name}`
                    : `${item.targetCategory.emoji} ${language === 'DE' ? 'Allgemein' : 'General'}`;
                  return (
                    <div
                      key={item.canonicalName}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[var(--parchment-bg)] border border-[var(--forest-green)]/30 text-xs font-body"
                    >
                      <span className="font-semibold text-[var(--sepia-text)] flex items-center gap-1.5 min-w-0 truncate">
                        <span>{item.emoji}</span>
                        <span className="truncate">{item.canonicalName}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] text-[var(--sepia-muted)] shrink-0">
                        <ArrowRight className="w-3 h-3 text-[var(--forest-green)] shrink-0" />
                        <span className="font-medium text-[var(--sepia-text)]">
                          {item.targetCategory.emoji} {catName}
                        </span>
                        <span className="opacity-60">›</span>
                        <span className="font-semibold text-[var(--forest-green)]">{subName}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
