'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  SPIRIT_FLAVOR_TAXONOMY,
  getEffectiveFlavorTaxonomy,
  getStoredCustomSubcategories,
  FlavorDescriptor,
  RADAR_DIMENSION_COLORS,
} from '@/data/spirit-flavor-taxonomy';
import { CustomFlavorDescriptor } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { isTagSelected } from '@/components/features/flavor-tags/FlavorTagSelector';
import { X, Check, Search } from 'lucide-react';
import { AromaIcon } from '@/components/ui/AromaIcon';
import { cn } from '@/lib/utils';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

interface SensoryCompassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  noseFlavorTags?: string[];
  tasteFlavorTags?: string[];
  onNoseTagsChange?: (tags: string[]) => void;
  onTasteTagsChange?: (tags: string[]) => void;
  activeSensoryMode: 'nose' | 'taste';
  onSensoryModeChange: (mode: 'nose' | 'taste') => void;
  customFlavors: CustomFlavorDescriptor[];
}

export function isCustomFlavorInCategory(cf: CustomFlavorDescriptor, catId: string): boolean {
  if (cf.categoryId) {
    return cf.categoryId.toLowerCase() === catId.toLowerCase();
  }
  const cat = SPIRIT_FLAVOR_TAXONOMY.find((c) => c.id === catId);
  if (!cat) return false;
  if (cf.radarDimension === cat.radarDimension) return true;
  if (catId === 'holzig' && (cf.radarDimension === 'woody' || cf.radarDimension === 'nutty')) return true;
  if (catId === 'suesse' && (cf.radarDimension === 'cereal' || cf.radarDimension === 'chocolate')) return true;
  return false;
}

interface SelectableAromaRow {
  id: string;
  name: string;
  description?: string;
  subcategoryId?: string;
  emoji: string;
  color: string;
  isSelectedInCurrent: boolean;
  isSelectedInOther: boolean;
  onToggle: () => void;
}

export function SensoryCompassDrawer({
  isOpen,
  onClose,
  noseFlavorTags = [],
  tasteFlavorTags = [],
  onNoseTagsChange,
  onTasteTagsChange,
  activeSensoryMode,
  onSensoryModeChange,
  customFlavors,
}: SensoryCompassDrawerProps) {
  useLockBodyScroll(isOpen, onClose);
  const { language, t } = useLanguage();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentActiveTags = activeSensoryMode === 'nose' ? noseFlavorTags : tasteFlavorTags;
  const otherActiveTags = activeSensoryMode === 'nose' ? tasteFlavorTags : noseFlavorTags;

  const effectiveTaxonomy = useMemo(() => {
    void isOpen;
    return getEffectiveFlavorTaxonomy();
  }, [isOpen]);

  const customSubcategories = useMemo(() => {
    void isOpen;
    return getStoredCustomSubcategories(language);
  }, [isOpen, language]);

  const handleDescriptorToggle = useCallback(
    (desc: FlavorDescriptor) => {
      const isCurrentlySelected = isTagSelected(desc, currentActiveTags);
      const primaryName = desc.name[language] ?? desc.name.EN;

      let updatedTags: string[];
      if (isCurrentlySelected) {
        updatedTags = currentActiveTags.filter((tag) => {
          const tLower = tag.trim().toLowerCase();
          const descEN = desc.name.EN.toLowerCase();
          const descDE = desc.name.DE.toLowerCase();
          const descId = desc.id.toLowerCase();
          const aliases = (desc.aliases || []).map((a) => a.toLowerCase());

          return (
            tLower !== descId &&
            tLower !== descEN &&
            tLower !== descDE &&
            !aliases.includes(tLower)
          );
        });
      } else {
        updatedTags = [...currentActiveTags, primaryName];
      }

      if (activeSensoryMode === 'nose') {
        onNoseTagsChange?.(updatedTags);
      } else {
        onTasteTagsChange?.(updatedTags);
      }
    },
    [currentActiveTags, language, activeSensoryMode, onNoseTagsChange, onTasteTagsChange]
  );

  const handleCustomFlavorToggle = useCallback(
    (cf: CustomFlavorDescriptor) => {
      const isSelected = currentActiveTags.some(
        (t) =>
          t.trim().toLowerCase() === cf.name.toLowerCase() ||
          t.trim().toLowerCase() === cf.id.toLowerCase()
      );

      let updatedTags: string[];
      if (isSelected) {
        updatedTags = currentActiveTags.filter(
          (t) =>
            t.trim().toLowerCase() !== cf.name.toLowerCase() &&
            t.trim().toLowerCase() !== cf.id.toLowerCase()
        );
      } else {
        updatedTags = [...currentActiveTags, cf.name];
      }

      if (activeSensoryMode === 'nose') {
        onNoseTagsChange?.(updatedTags);
      } else {
        onTasteTagsChange?.(updatedTags);
      }
    },
    [currentActiveTags, activeSensoryMode, onNoseTagsChange, onTasteTagsChange]
  );

  const q = searchQuery.trim().toLowerCase();

  // Build unified category lists (identical to AromaCatalogView, but in Select-Mode)
  const filteredCategories = useMemo(() => {
    return effectiveTaxonomy
      .filter((cat) => selectedCategoryId === 'all' || cat.id === selectedCategoryId)
      .map((cat) => {
        const catColor = cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27';
        const rows: SelectableAromaRow[] = [];
        const catSubcategories = customSubcategories.filter((s) => s.categoryId === cat.id);
        const validSubcategoryIds = new Set(catSubcategories.map((s) => s.id));

        // 1. User-created aromas in this category
        customFlavors.forEach((cf) => {
          if (!isCustomFlavorInCategory(cf, cat.id)) return;
          if (
            q &&
            !cf.name.toLowerCase().includes(q) &&
            !cf.id.toLowerCase().includes(q) &&
            !cf.description?.toLowerCase().includes(q)
          ) {
            return;
          }

          const isSelectedInCurrent = currentActiveTags.some(
            (t) =>
              t.trim().toLowerCase() === cf.name.toLowerCase() ||
              t.trim().toLowerCase() === cf.id.toLowerCase()
          );
          const isSelectedInOther =
            !isSelectedInCurrent &&
            otherActiveTags.some(
              (t) =>
                t.trim().toLowerCase() === cf.name.toLowerCase() ||
                t.trim().toLowerCase() === cf.id.toLowerCase()
            );

          rows.push({
            id: cf.id,
            name: cf.name,
            description: cf.description,
            subcategoryId:
              cf.subcategoryId && validSubcategoryIds.has(cf.subcategoryId)
                ? cf.subcategoryId
                : undefined,
            emoji: cf.emoji !== undefined ? cf.emoji : cat.emoji,
            color: cf.color || catColor,
            isSelectedInCurrent,
            isSelectedInOther,
            onToggle: () => handleCustomFlavorToggle(cf),
          });
        });

        // 2. Taxonomy aromas in this category
        cat.subcategories.forEach((sub) => {
          sub.descriptors.forEach((desc) => {
            if (q) {
              const matchesSearch =
                desc.name.EN.toLowerCase().includes(q) ||
                desc.name.DE.toLowerCase().includes(q) ||
                desc.id.toLowerCase().includes(q) ||
                (desc.description && desc.description.toLowerCase().includes(q)) ||
                (desc.aliases || []).some((a) => a.toLowerCase().includes(q));
              if (!matchesSearch) return;
            }

            const label = desc.name[language] ?? desc.name.EN;
            const isSelectedInCurrent = isTagSelected(desc, currentActiveTags);
            const isSelectedInOther = !isSelectedInCurrent && isTagSelected(desc, otherActiveTags);

            rows.push({
              id: desc.id,
              name: label,
              description: desc.description,
              subcategoryId:
                desc.subcategoryId && validSubcategoryIds.has(desc.subcategoryId)
                  ? desc.subcategoryId
                  : undefined,
              emoji: desc.emoji !== undefined ? desc.emoji : cat.emoji,
              color: desc.color || catColor,
              isSelectedInCurrent,
              isSelectedInOther,
              onToggle: () => handleDescriptorToggle(desc),
            });
          });
        });

        const selectedInCatCount = rows.filter((r) => r.isSelectedInCurrent).length;

        return {
          ...cat,
          rows,
          catSubcategories,
          totalItems: rows.length,
          selectedInCatCount,
        };
      })
      .filter((cat) => cat.totalItems > 0 || (selectedCategoryId === cat.id && !q));
  }, [
    effectiveTaxonomy,
    selectedCategoryId,
    customFlavors,
    customSubcategories,
    q,
    language,
    currentActiveTags,
    otherActiveTags,
    handleCustomFlavorToggle,
    handleDescriptorToggle,
  ]);

  if (!isOpen || typeof window === 'undefined') return null;

  const totalSelectedCount = noseFlavorTags.length + tasteFlavorTags.length;

  const renderSelectableRow = (row: SelectableAromaRow) => (
    <button
      key={row.id}
      type="button"
      onClick={row.onToggle}
      aria-pressed={row.isSelectedInCurrent}
      className={cn(
        'w-full flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[var(--parchment-border)]/50 md:odd:border-r text-left transition-all cursor-pointer select-none',
        row.isSelectedInCurrent
          ? activeSensoryMode === 'nose'
            ? 'bg-[var(--sensory-nose)]/15 hover:bg-[var(--sensory-nose)]/25'
            : 'bg-[var(--sensory-taste)]/15 hover:bg-[var(--sensory-taste)]/25'
          : 'hover:bg-[var(--pub-bg-panel)]'
      )}
    >
      {/* Left: Emoji + Name + Color Dot + Optional Description */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {row.emoji && (
          <span className="text-lg leading-none select-none shrink-0 w-6 text-center">
            {row.emoji}
          </span>
        )}

        <div className="min-w-0 flex-1 flex flex-col">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'font-body text-sm truncate',
                row.isSelectedInCurrent
                  ? 'font-bold text-[var(--foreground)]'
                  : 'font-semibold text-[var(--sepia-text)]'
              )}
            >
              {row.name}
            </span>
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: row.color }}
            />
          </div>
          {row.description && (
            <span className="font-body text-xs text-[var(--sepia-muted)] italic truncate mt-0.5">
              {row.description}
            </span>
          )}
        </div>
      </div>

      {/* Right: Selection Status in THIS Whisky Note (In Nase / In Geschmack) */}
      <div className="flex items-center gap-1.5 shrink-0">
        {row.isSelectedInOther && (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[11px] font-body font-semibold border pointer-events-none',
              activeSensoryMode === 'nose'
                ? 'bg-[var(--sensory-taste)]/15 border-[var(--sensory-taste)]/40 text-[var(--sensory-taste)]'
                : 'bg-[var(--sensory-nose)]/15 border-[var(--sensory-nose)]/40 text-[var(--sensory-nose)]'
            )}
          >
            {activeSensoryMode === 'nose' ? t('inTaste') : t('inNose')}
          </span>
        )}

        {row.isSelectedInCurrent ? (
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-white text-xs font-body font-bold flex items-center gap-1 shadow-2xs',
              activeSensoryMode === 'nose'
                ? 'bg-[var(--sensory-nose)]'
                : 'bg-[var(--sensory-taste)]'
            )}
          >
            <Check className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {activeSensoryMode === 'nose' ? t('inNose') : t('inTaste')}
            </span>
          </span>
        ) : (
          <span className="w-6 h-6 rounded-full border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] flex items-center justify-center text-transparent">
            <Check className="w-3.5 h-3.5" />
          </span>
        )}
      </div>
    </button>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl h-[96dvh] sm:h-[90vh] bg-[var(--pub-bg)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Modal Top Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-[var(--wood-dark)] text-white border-b border-black/10 shadow-sm shrink-0 gap-3">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <AromaIcon className="w-6 h-6 text-amber-200 shrink-0" />
            <h3 className="font-display font-bold text-base sm:text-xl tracking-wide text-white drop-shadow-xs truncate">
              {t('sensoryDrawerTitle')}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            aria-label={t('close')}
            title={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 1b. Full-Width 2-Tab Bar Below Header (Nase | Geschmack) ── */}
        <div className="px-3 sm:px-6 py-2.5 bg-[var(--parchment-bg-alt)]/60 border-b border-[var(--parchment-border)]/60 flex items-center shrink-0">
          <div className="grid grid-cols-2 gap-2 w-full p-1 rounded-xl bg-black/5 border border-[var(--parchment-border)]/40">
            <button
              type="button"
              onClick={() => onSensoryModeChange('nose')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-display font-bold transition-all cursor-pointer truncate',
                activeSensoryMode === 'nose'
                  ? 'bg-[var(--sensory-nose)] text-white shadow-xs'
                  : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-[var(--pub-bg-panel)]'
              )}
            >
              <span>{language === 'DE' ? 'Nase' : 'Nose'}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold',
                  activeSensoryMode === 'nose'
                    ? 'bg-white/25 text-white'
                    : 'bg-black/15 text-[var(--foreground)]'
                )}
              >
                {noseFlavorTags.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSensoryModeChange('taste')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-display font-bold transition-all cursor-pointer truncate',
                activeSensoryMode === 'taste'
                  ? 'bg-[var(--sensory-taste)] text-white shadow-xs'
                  : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-[var(--pub-bg-panel)]'
              )}
            >
              <span>{language === 'DE' ? 'Geschmack' : 'Taste'}</span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold',
                  activeSensoryMode === 'taste'
                    ? 'bg-white/25 text-white'
                    : 'bg-black/15 text-[var(--foreground)]'
                )}
              >
                {tasteFlavorTags.length}
              </span>
            </button>
          </div>
        </div>

        {/* ── 2. Top Search & Category Quick-Filter Bar (Identical to AromaCatalogView) ── */}
        <div className="px-3 sm:px-6 pt-3 pb-1 bg-[var(--pub-bg)] shrink-0">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[var(--sepia-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchAromaCatalogPlaceholder')}
              className="w-full h-10 pl-9 pr-8 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)] text-xs sm:text-sm font-body text-[var(--sepia-text)] placeholder:text-[var(--placeholder-text)] focus:outline-none focus:border-[var(--wood-selection)] transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                title={t('clearSearch')}
                aria-label={t('clearSearch')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 text-[var(--sepia-muted)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Enlarged Category Quick-Filter Buttons (Default: 'all' shows all categories) */}
          <div className="flex items-center gap-2 pt-2.5 pb-1.5 flex-nowrap overflow-x-auto no-scrollbar snap-x snap-mandatory md:flex-wrap md:overflow-visible">
            <button
              type="button"
              onClick={() => setSelectedCategoryId('all')}
              className={cn(
                'min-h-[42px] px-4 py-2 rounded-full text-xs sm:text-sm font-body font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center justify-center shrink-0 snap-start active:scale-95',
                selectedCategoryId === 'all'
                  ? 'bg-[var(--wood-selection)] text-white border-[var(--wood-selection)] shadow-xs'
                  : 'bg-[var(--pub-bg-panel)] text-[var(--foreground)] border-[var(--parchment-border)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)]'
              )}
            >
              {t('allCategoriesFilter')}
            </button>
            {effectiveTaxonomy.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              const catTitle = cat.name[language] ?? cat.name.EN;
              const activeInCatCount = cat.subcategories
                .flatMap((s) => s.descriptors)
                .filter((d) => isTagSelected(d, currentActiveTags)).length;
              const activeCustomInCatCount = customFlavors
                .filter((cf) => isCustomFlavorInCategory(cf, cat.id))
                .filter((cf) =>
                  currentActiveTags.some(
                    (t) =>
                      t.trim().toLowerCase() === cf.name.toLowerCase() ||
                      t.trim().toLowerCase() === cf.id.toLowerCase()
                  )
                ).length;
              const totalCatActive = activeInCatCount + activeCustomInCatCount;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(isSelected ? 'all' : cat.id)}
                  className={cn(
                    'min-h-[42px] px-4 py-2 rounded-full text-xs sm:text-sm font-body font-semibold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 shrink-0 snap-start active:scale-95',
                    isSelected
                      ? 'bg-[var(--wood-selection)] text-white border-[var(--wood-selection)] shadow-xs'
                      : 'bg-[var(--pub-bg-panel)] text-[var(--foreground)] border-[var(--parchment-border)] hover:bg-[var(--pub-bg-alt)] hover:border-[var(--wood-selection)]'
                  )}
                >
                  <span className="text-lg leading-none">{cat.emoji}</span>
                  <span>{catTitle}</span>
                  {totalCatActive > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-[11px] font-mono font-extrabold',
                        isSelected
                          ? 'bg-white/25 text-white'
                          : 'bg-[var(--wood-selection)] text-white'
                      )}
                    >
                      {totalCatActive}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="divider-clover-glow mt-1 mb-1" />
        </div>

        {/* ── 3. Main Scrollable Catalog Body (Select-Mode: All Categories & Subcategory Boxes) ── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 flex flex-col gap-5">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--parchment-border)] rounded-2xl bg-[var(--parchment-bg)]">
              <AromaIcon className="w-10 h-10 text-[var(--sepia-muted)] opacity-50" />
              <p className="text-sm sm:text-base text-[var(--sepia-muted)] font-body max-w-md">
                {language === 'DE'
                  ? `Keine passenden Aromen für "${searchQuery}" gefunden.`
                  : `No matching flavors found for "${searchQuery}".`}
              </p>
            </div>
          ) : (
            filteredCategories.map((cat) => {
              const catTitle = cat.name[language] ?? cat.name.EN;
              const catColor = cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27';
              const hasSubcategories = cat.catSubcategories.length > 0;
              const uncategorizedRows = cat.rows.filter((r) => !r.subcategoryId);

              return (
                <section
                  key={cat.id}
                  className="rounded-2xl border border-[var(--parchment-border)] bg-[var(--parchment-bg)] shadow-xs overflow-hidden shrink-0"
                >
                  {/* Minimalist Category Header Bar (No total count badge) */}
                  <div
                    className="px-4 sm:px-5 py-2.5 sm:py-3 border-b border-[var(--wood-dark)]/80 bg-[var(--wood-dark)] flex items-center justify-between gap-3"
                    style={{ borderLeftWidth: '5px', borderLeftColor: catColor }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg sm:text-xl leading-none shrink-0">{cat.emoji}</span>
                      <h4 className="font-display font-bold text-sm sm:text-base text-[var(--fab-text)] tracking-wide truncate">
                        {catTitle}
                      </h4>
                    </div>

                    {cat.selectedInCatCount > 0 && (
                      <span className="px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-body font-bold flex items-center gap-1 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                        <span>
                          {cat.selectedInCatCount}{' '}
                          {language === 'DE' ? 'ausgewählt' : 'selected'}
                        </span>
                      </span>
                    )}
                  </div>

                  {!hasSubcategories ? (
                    /* Flat 2-Column Selectable Aroma Rows */
                    <div className="divide-y divide-[var(--parchment-border)]/60 grid grid-cols-1 md:grid-cols-2 md:divide-y-0">
                      {cat.rows.map((row) => renderSelectableRow(row))}
                    </div>
                  ) : (
                    /* Full-Width Stacked Subcategory Folders in Select-Mode ("Allgemein" on top, zero vertical gaps) */
                    <div className="flex flex-col gap-3 p-3 sm:p-4">
                      {uncategorizedRows.length > 0 && (
                        <div className="w-full rounded-xl border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)]/45 overflow-hidden">
                          <div className="px-4 py-2 bg-[var(--pub-bg-alt)]/75 border-b border-[var(--parchment-border)] flex items-center gap-2">
                            <span className="text-base leading-none shrink-0">{cat.emoji}</span>
                            <span className="font-display font-bold text-xs sm:text-sm text-[var(--foreground)]">
                              {language === 'DE' ? 'Allgemein' : 'General'}
                            </span>
                          </div>
                          <div className="divide-y divide-[var(--parchment-border)]/50 grid grid-cols-1 md:grid-cols-2 md:divide-y-0">
                            {uncategorizedRows.map((row) => renderSelectableRow(row))}
                          </div>
                        </div>
                      )}

                      {cat.catSubcategories.map((sub) => {
                        const subRows = cat.rows.filter((r) => r.subcategoryId === sub.id);
                        if (subRows.length === 0) return null;

                        return (
                          <div
                            key={sub.id}
                            className="w-full rounded-xl border border-[var(--parchment-border)] bg-[var(--pub-bg-panel)]/45 overflow-hidden"
                          >
                            <div className="px-4 py-2 bg-[var(--pub-bg-alt)]/75 border-b border-[var(--parchment-border)] flex items-center gap-2">
                              {sub.emoji && (
                                <span className="text-base leading-none shrink-0">{sub.emoji}</span>
                              )}
                              <span className="font-display font-bold text-xs sm:text-sm text-[var(--foreground)] truncate">
                                {sub.name}
                              </span>
                            </div>
                            <div className="divide-y divide-[var(--parchment-border)]/50 grid grid-cols-1 md:grid-cols-2 md:divide-y-0">
                              {subRows.map((row) => renderSelectableRow(row))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })
          )}
        </div>

        {/* ── 4. Sticky Bottom Summary & Done Bar ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3 bg-[var(--pub-bg-alt)]/90 border-t border-[var(--parchment-border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-display font-bold text-[var(--sepia-text)]">
              {t('activeFlavorsSummary')}:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-extrabold shadow-2xs">
              {totalSelectedCount}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-display font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center"
          >
            <span>{t('done')}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
