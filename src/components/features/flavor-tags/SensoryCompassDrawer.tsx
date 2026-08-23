'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  SPIRIT_FLAVOR_TAXONOMY,
  FlavorDescriptor,
  RADAR_DIMENSION_COLORS,
  getFlavorColor,
} from '@/data/spirit-flavor-taxonomy';
import { CustomFlavorDescriptor } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { isTagSelected } from '@/components/features/flavor-tags/FlavorTagSelector';
import { Compass, X, Check, Plus, Sparkles, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onRequestCustomFlavor: () => void;
  onDeleteCustomFlavor: (e: React.MouseEvent, id: string) => void;
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
  onRequestCustomFlavor,
  onDeleteCustomFlavor,
}: SensoryCompassDrawerProps) {
  const { language, t } = useLanguage();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('fruchtig');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentActiveTags = activeSensoryMode === 'nose' ? noseFlavorTags : tasteFlavorTags;
  const otherActiveTags = activeSensoryMode === 'nose' ? tasteFlavorTags : noseFlavorTags;

  // Real-time search across all standard categories & descriptors
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const matches: { descriptor: FlavorDescriptor; categoryName: string; categoryEmoji: string }[] = [];

    SPIRIT_FLAVOR_TAXONOMY.forEach((cat) => {
      const catTitle = cat.name[language] ?? cat.name.EN;
      cat.subcategories.forEach((sub) => {
        sub.descriptors.forEach((desc) => {
          const nameEN = desc.name.EN.toLowerCase();
          const nameDE = desc.name.DE.toLowerCase();
          const id = desc.id.toLowerCase();
          const aliases = (desc.aliases || []).map((a) => a.toLowerCase());

          if (
            nameEN.includes(q) ||
            nameDE.includes(q) ||
            id.includes(q) ||
            aliases.some((a) => a.includes(q))
          ) {
            matches.push({
              descriptor: desc,
              categoryName: catTitle,
              categoryEmoji: cat.emoji,
            });
          }
        });
      });
    });

    return matches;
  }, [searchQuery, language]);

  // Real-time search across custom flavors
  const matchingCustomFlavors = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return customFlavors.filter(
      (cf) => cf.name.toLowerCase().includes(q) || cf.id.toLowerCase().includes(q)
    );
  }, [searchQuery, customFlavors]);

  if (!isOpen) return null;

  const handleDescriptorToggle = (desc: FlavorDescriptor) => {
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
  };

  const handleCustomFlavorToggle = (cf: CustomFlavorDescriptor) => {
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
  };

  const totalSelectedCount = noseFlavorTags.length + tasteFlavorTags.length;
  const isSearchActive = searchQuery.trim().length > 0;

  if (!isOpen || typeof window === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-7xl h-[94vh] sm:h-[90vh] bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header with distinct Sensory Mode Switcher and well-separated Close button */}
        <div className="flex items-center justify-between px-4 sm:px-7 py-3.5 bg-gradient-to-r from-[var(--wood-dark)] to-[var(--wood-selection)] text-white border-b border-black/10 shadow-sm shrink-0 gap-3">
          {/* Left: Branding & Title */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Compass className="w-6 h-6 text-amber-200 shrink-0" />
            <h3 className="font-display font-bold text-base sm:text-xl tracking-wide text-white drop-shadow-xs truncate">
              {t('sensoryDrawerTitle')}
            </h3>
          </div>

          {/* Center: High-Contrast Sensory Mode Switcher (Nase / Geschmack) */}
          <div className="flex items-center p-1 rounded-xl bg-black/35 border border-white/20 shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => onSensoryModeChange('nose')}
              className={cn(
                'px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-body font-black rounded-lg transition-all cursor-pointer flex items-center gap-2',
                activeSensoryMode === 'nose'
                  ? 'bg-[var(--sensory-nose)] text-white shadow-md scale-[1.02]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <span>{language === 'DE' ? 'Nase' : 'Nose'}</span>
              <span className={cn(
                "px-2 py-0.2 rounded-full text-[11px] font-mono font-extrabold",
                activeSensoryMode === 'nose' ? "bg-white/30 text-white" : "bg-black/30 text-white/80"
              )}>
                {noseFlavorTags.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onSensoryModeChange('taste')}
              className={cn(
                'px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-body font-black rounded-lg transition-all cursor-pointer flex items-center gap-2',
                activeSensoryMode === 'taste'
                  ? 'bg-[var(--sensory-taste)] text-white shadow-md scale-[1.02]'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <span>{language === 'DE' ? 'Geschmack' : 'Taste'}</span>
              <span className={cn(
                "px-2 py-0.2 rounded-full text-[11px] font-mono font-extrabold",
                activeSensoryMode === 'taste' ? "bg-white/30 text-white" : "bg-black/30 text-white/80"
              )}>
                {tasteFlavorTags.length}
              </span>
            </button>
          </div>

          {/* Right: Distinct Close (X) Button (Generously Spaced) */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all cursor-pointer shadow-xs shrink-0"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Search Bar Styled with Forest Green Border and Tasting Card Parchment Background */}
        <div className="px-4 sm:px-7 py-3 bg-[var(--parchment-bg-alt)]/60 border-b border-[var(--parchment-border)]/60 flex items-center gap-3 shrink-0">
          <div className="relative flex items-center bg-[var(--parchment-bg)] hover:bg-[var(--parchment-bg)] focus-within:bg-[var(--parchment-bg)] border-[1.5px] border-[var(--forest-green)]/45 focus-within:border-[var(--forest-green)] rounded-full px-4 h-11 transition-all duration-200 shadow-xs focus-within:shadow-[0_2px_14px_rgba(46,148,93,0.20)] flex-1">
            <Search size={17} className="text-[var(--forest-green)] mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'DE'
                  ? 'Aromen durchsuchen (z.B. Banane, Vanille, Honig, Karamell, Malz, Rauch, Eiche)...'
                  : 'Search aromas (e.g. Banana, Vanilla, Honey, Caramel, Malt, Smoke, Oak)...'
              }
              className="bg-transparent border-none text-xs sm:text-sm text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/70 focus:outline-none focus:ring-0 focus-within:ring-0 w-full pr-8 font-body"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/10 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
          {isSearchActive && (
            <span className="text-xs font-body font-bold text-[var(--forest-green)] shrink-0 hidden sm:inline-block">
              {searchResults.length + matchingCustomFlavors.length} {language === 'DE' ? 'Treffer' : 'results'}
            </span>
          )}
        </div>

        {/* Mobile-Only Horizontal Category Scroll Bar (< lg, only visible when not searching) */}
        {!isSearchActive && (
          <div className="flex lg:hidden items-center gap-1.5 px-4 py-2.5 bg-[var(--pub-bg-alt)]/60 border-b border-[var(--parchment-border)] overflow-x-auto shrink-0 no-scrollbar">
            {SPIRIT_FLAVOR_TAXONOMY.map((cat) => {
              const isCatActive = activeCategoryId === cat.id;
              const catName = cat.name[language] ?? cat.name.EN;
              const activeInCatCount = cat.subcategories
                .flatMap((s) => s.descriptors)
                .filter((d) => isTagSelected(d, currentActiveTags)).length;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-xs font-body font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer select-none',
                    isCatActive
                      ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-xs scale-[1.02]'
                      : 'border-[var(--parchment-border)] bg-white/40 text-[var(--sepia-text)] hover:bg-white/70'
                  )}
                >
                  <span>{cat.emoji}</span>
                  <span>{catName}</span>
                  {activeInCatCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/25 text-white font-extrabold">
                      {activeInCatCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Custom Aromas Tab (Mobile) */}
            <button
              type="button"
              onClick={() => setActiveCategoryId('custom_aromas_tab')}
              className={cn(
                'px-3 py-1.5 rounded-full border text-xs font-body font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer select-none',
                activeCategoryId === 'custom_aromas_tab'
                  ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-xs scale-[1.02]'
                  : 'border-[var(--brass-accent)]/50 bg-[var(--brass-accent)]/10 text-[var(--foreground)] hover:bg-[var(--brass-accent)]/20'
              )}
            >
              <span>✨</span>
              <span>{t('customFlavorsCategory')}</span>
              {customFlavors.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[var(--wood-selection)] text-white font-extrabold">
                  {customFlavors.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {isSearchActive ? (
            /* Live Search Results View */
            <div className="flex-1 p-5 sm:p-7 overflow-y-auto flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/60 pb-2">
                <div className="flex items-center gap-2">
                  <Search className="w-5 h-5 text-[var(--brass-accent)]" />
                  <h4 className="text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                    {language === 'DE' ? 'Suchergebnisse für' : 'Search Results for'} &ldquo;{searchQuery}&rdquo;
                  </h4>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[var(--wood-selection)] text-white shadow-xs">
                  {searchResults.length + matchingCustomFlavors.length} {language === 'DE' ? 'Aromen' : 'flavors'}
                </span>
              </div>

              {searchResults.length === 0 && matchingCustomFlavors.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--parchment-border)] rounded-2xl bg-[var(--sepia-text)]/5">
                  <Compass className="w-10 h-10 text-[var(--sepia-muted)] opacity-50" />
                  <p className="text-sm sm:text-base text-[var(--sepia-muted)] font-body max-w-md">
                    {language === 'DE'
                      ? `Keine passenden Aromen für "${searchQuery}" gefunden.`
                      : `No matching flavors found for "${searchQuery}".`}
                  </p>
                  <button
                    type="button"
                    onClick={onRequestCustomFlavor}
                    className="mt-2 px-4 py-2 rounded-xl bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-display font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:scale-[1.02] transition-transform"
                  >
                    + {t('createCustomFlavor')} &ldquo;{searchQuery}&rdquo;
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* Matching Standard Taxonomy Descriptors */}
                  {searchResults.length > 0 && (
                    <div className="flex flex-wrap gap-2.5">
                      {searchResults.map(({ descriptor: desc, categoryName, categoryEmoji }) => {
                        const tagName = desc.name[language] ?? desc.name.EN;
                        const isSelectedInCurrent = isTagSelected(desc, currentActiveTags);
                        const isSelectedInOther = !isSelectedInCurrent && isTagSelected(desc, otherActiveTags);
                        const dotColor = desc.color ?? RADAR_DIMENSION_COLORS[desc.radarDimension] ?? '#C59B27';

                        return (
                          <button
                            key={desc.id}
                            type="button"
                            onClick={() => handleDescriptorToggle(desc)}
                            className={cn(
                              'px-3.5 py-2 rounded-full border text-xs sm:text-sm font-bold font-body transition-all duration-150 flex items-center gap-2 cursor-pointer select-none min-h-[38px] shadow-xs',
                              isSelectedInCurrent
                                ? activeSensoryMode === 'nose'
                                  ? 'bg-[var(--sensory-nose)] border-[var(--sensory-nose)] text-white shadow-sm scale-[1.02]'
                                  : 'bg-[var(--sensory-taste)] border-[var(--sensory-taste)] text-white shadow-sm scale-[1.02]'
                                : isSelectedInOther
                                ? activeSensoryMode === 'nose'
                                  ? 'bg-[var(--sensory-taste)]/15 border-[var(--sensory-taste)]/60 text-[var(--sensory-taste)] font-semibold'
                                  : 'bg-[var(--sensory-nose)]/15 border-[var(--sensory-nose)]/60 text-[var(--sensory-nose)] font-semibold'
                                : 'bg-white/80 dark:bg-black/30 border-[var(--parchment-border)] text-[var(--foreground)] hover:bg-white hover:border-[var(--wood-selection)] hover:scale-[1.01]'
                            )}
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                              style={{ backgroundColor: dotColor }}
                            />
                            <span>{tagName}</span>
                            <span className="text-[11px] opacity-65 font-normal">
                              ({categoryEmoji} {categoryName})
                            </span>
                            {isSelectedInCurrent && <Check size={14} className="ml-0.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Matching Custom Aromas */}
                  {matchingCustomFlavors.length > 0 && (
                    <div className="flex flex-col gap-3 pt-4 border-t border-[var(--parchment-border)]/50">
                      <span className="text-xs font-display font-bold uppercase tracking-wider text-[var(--sepia-muted)]">
                        {t('customFlavorsCategory')}
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {matchingCustomFlavors.map((cf) => {
                          const isSelected = currentActiveTags.some(
                            (t) =>
                              t.trim().toLowerCase() === cf.name.toLowerCase() ||
                              t.trim().toLowerCase() === cf.id.toLowerCase()
                          );
                          const chipColor = cf.color ?? getFlavorColor(cf.name);

                          return (
                            <button
                              key={cf.id}
                              type="button"
                              onClick={() => handleCustomFlavorToggle(cf)}
                              className={cn(
                                'px-3.5 py-2 rounded-full border text-xs sm:text-sm font-body font-bold transition-all duration-150 flex items-center gap-2 cursor-pointer select-none min-h-[38px] shadow-xs',
                                isSelected
                                  ? 'border-transparent text-white shadow-sm scale-[1.02]'
                                  : 'border-[var(--parchment-border)] bg-white/80 dark:bg-black/30 text-[var(--foreground)] hover:border-[var(--wood-selection)] hover:bg-white'
                              )}
                              style={{
                                backgroundColor: isSelected ? chipColor : undefined,
                              }}
                            >
                              <span>{cf.emoji || '✨'}</span>
                              <span>{cf.name}</span>
                              {isSelected && <Check size={14} className="ml-0.5 text-white" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Standard Categorized View */
            <>
              {/* Desktop Left Category Sidebar (>= lg screens) */}
              <div className="hidden lg:flex flex-col w-64 bg-[var(--parchment-bg-alt)]/70 border-r border-[var(--parchment-border)] p-3 overflow-y-auto gap-1 shrink-0">
                <span className="text-[11px] font-display uppercase tracking-wider font-bold text-[var(--sepia-muted)] px-3 py-1.5">
                  {language === 'DE' ? 'Aromen-Kategorien' : 'Aroma Categories'}
                </span>

                {SPIRIT_FLAVOR_TAXONOMY.map((cat) => {
                  const isCatActive = activeCategoryId === cat.id;
                  const catName = cat.name[language] ?? cat.name.EN;
                  const activeInCatCount = cat.subcategories
                    .flatMap((s) => s.descriptors)
                    .filter((d) => isTagSelected(d, currentActiveTags)).length;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={cn(
                        'px-3.5 py-2.5 rounded-xl border text-sm font-body font-bold transition-all flex items-center justify-between gap-2 cursor-pointer select-none text-left',
                        isCatActive
                          ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-sm'
                          : 'border-transparent hover:bg-white/60 text-[var(--foreground)]'
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-base">{cat.emoji}</span>
                        <span className="truncate">{catName}</span>
                      </div>
                      {activeInCatCount > 0 && (
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-full text-xs font-mono font-bold',
                            isCatActive ? 'bg-white/25 text-white' : 'bg-[var(--wood-selection)] text-white'
                          )}
                        >
                          {activeInCatCount}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* Custom Aromas Sidebar Item */}
                <button
                  type="button"
                  onClick={() => setActiveCategoryId('custom_aromas_tab')}
                  className={cn(
                    'mt-2 px-3.5 py-2.5 rounded-xl border text-sm font-body font-bold transition-all flex items-center justify-between gap-2 cursor-pointer select-none text-left',
                    activeCategoryId === 'custom_aromas_tab'
                      ? 'bg-[var(--wood-selection)] border-[var(--wood-selection)] text-white shadow-sm'
                      : 'border-[var(--brass-accent)]/40 bg-[var(--brass-accent)]/10 text-[var(--foreground)] hover:bg-[var(--brass-accent)]/20'
                  )}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span>✨</span>
                    <span className="truncate">{t('customFlavorsCategory')}</span>
                  </div>
                  {customFlavors.length > 0 && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-mono font-bold',
                        activeCategoryId === 'custom_aromas_tab'
                          ? 'bg-white/25 text-white'
                          : 'bg-[var(--wood-selection)] text-white'
                      )}
                    >
                      {customFlavors.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Right Area: Spacious Multi-Column Descriptor Cards */}
              <div className="flex-1 p-5 sm:p-7 overflow-y-auto flex flex-col gap-6">
                {activeCategoryId === 'custom_aromas_tab' ? (
                  /* Custom Aromas Tab Content */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/60 pb-3">
                      <div className="flex flex-col gap-0.5">
                        <h4 className="text-base sm:text-lg font-display font-bold text-[var(--foreground)]">
                          {t('customFlavorsCategory')} ({customFlavors.length})
                        </h4>
                        <p className="text-xs sm:text-sm text-[var(--sepia-muted)] font-body">
                          {language === 'DE'
                            ? 'Individuell erstellte Aromen für dein persönliches Journal.'
                            : 'Custom aromas crafted for your personal journal.'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={onRequestCustomFlavor}
                        className="px-3.5 py-2 rounded-lg bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-body font-bold flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.02] transition-transform"
                      >
                        <Plus size={15} />
                        <span>{t('createCustomFlavor')}</span>
                      </button>
                    </div>

                    {customFlavors.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {customFlavors.map((cf) => {
                          const isSelected = currentActiveTags.some(
                            (t) =>
                              t.trim().toLowerCase() === cf.name.toLowerCase() ||
                              t.trim().toLowerCase() === cf.id.toLowerCase()
                          );
                          const chipColor = cf.color ?? getFlavorColor(cf.name);

                          return (
                            <div
                              key={cf.id}
                              className={cn(
                                'flex items-center justify-between rounded-xl border text-sm font-body font-bold transition-all duration-150 select-none min-h-[44px] px-3.5 shadow-2xs overflow-hidden',
                                isSelected
                                  ? 'border-transparent text-white shadow-md scale-[1.01]'
                                  : 'border-[var(--parchment-border)] bg-white/50 dark:bg-black/20 text-[var(--foreground)] hover:border-[var(--wood-selection)] hover:bg-white/80'
                              )}
                              style={{
                                backgroundColor: isSelected ? chipColor : undefined,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => handleCustomFlavorToggle(cf)}
                                className="flex items-center gap-2 cursor-pointer flex-1 py-2 text-left truncate"
                              >
                                <span className="text-base shrink-0">{cf.emoji || '✨'}</span>
                                <span className="truncate">{cf.name}</span>
                              </button>
                              <div className="flex items-center gap-1 shrink-0">
                                {isSelected && <Check size={16} className="text-white mr-1" />}
                                <button
                                  type="button"
                                  onClick={(e) => onDeleteCustomFlavor(e, cf.id)}
                                  className="px-1.5 py-1 text-sm opacity-60 hover:opacity-100 hover:text-red-400 cursor-pointer transition-opacity"
                                  title={t('customFlavorDeleted')}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-[var(--parchment-border)] rounded-2xl bg-[var(--sepia-text)]/5">
                        <Sparkles className="w-8 h-8 text-[var(--brass-accent)]" />
                        <p className="text-sm sm:text-base text-[var(--sepia-muted)] font-body max-w-md">
                          {language === 'DE'
                            ? 'Noch keine eigenen Aromen vorhanden. Erstelle individuelle Aromen für dein Journal!'
                            : 'No custom aromas yet. Create individual flavor descriptors for your journal!'}
                        </p>
                        <button
                          type="button"
                          onClick={onRequestCustomFlavor}
                          className="mt-2 px-4 py-2 rounded-xl bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-display font-bold uppercase tracking-wider cursor-pointer shadow-sm hover:scale-[1.02] transition-transform"
                        >
                          + {t('createCustomFlavor')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Standard SWRI Taxonomy Category Descriptors */
                  (() => {
                    const category = SPIRIT_FLAVOR_TAXONOMY.find((c) => c.id === activeCategoryId);
                    if (!category) return null;

                    return (
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2.5 border-b border-[var(--parchment-border)]/60 pb-2">
                          <span className="text-2xl">{category.emoji}</span>
                          <h4 className="text-lg sm:text-xl font-display font-bold text-[var(--foreground)]">
                            {category.name[language] ?? category.name.EN}
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                          {category.subcategories.map((sub) => {
                            const subName = sub.name[language] ?? sub.name.EN;

                            return (
                              <div
                                key={sub.id}
                                className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--parchment-bg-alt)]/50 border border-[var(--parchment-border)]/60"
                              >
                                <span className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[var(--sepia-muted)] border-b border-[var(--parchment-border)]/40 pb-1">
                                  {subName}
                                </span>

                                <div className="flex flex-wrap gap-2">
                                  {sub.descriptors.map((desc) => {
                                    const tagName = desc.name[language] ?? desc.name.EN;
                                    const isSelectedInCurrent = isTagSelected(desc, currentActiveTags);
                                    const isSelectedInOther = !isSelectedInCurrent && isTagSelected(desc, otherActiveTags);
                                    const dotColor = desc.color ?? RADAR_DIMENSION_COLORS[desc.radarDimension] ?? '#C59B27';

                                    return (
                                      <button
                                        key={desc.id}
                                        type="button"
                                        onClick={() => handleDescriptorToggle(desc)}
                                        className={cn(
                                          'px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold font-body transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none min-h-[34px]',
                                          isSelectedInCurrent
                                            ? activeSensoryMode === 'nose'
                                              ? 'bg-[var(--sensory-nose)] border-[var(--sensory-nose)] text-white shadow-xs'
                                              : 'bg-[var(--sensory-taste)] border-[var(--sensory-taste)] text-white shadow-xs'
                                            : isSelectedInOther
                                            ? activeSensoryMode === 'nose'
                                              ? 'bg-[var(--sensory-taste)]/15 border-[var(--sensory-taste)]/60 text-[var(--sensory-taste)] font-semibold'
                                              : 'bg-[var(--sensory-nose)]/15 border-[var(--sensory-nose)]/60 text-[var(--sensory-nose)] font-semibold'
                                            : 'bg-white/70 dark:bg-black/20 border-[var(--parchment-border)] text-[var(--foreground)] hover:bg-white hover:border-[var(--wood-selection)]'
                                        )}
                                      >
                                        <span
                                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                                          style={{ backgroundColor: dotColor }}
                                        />
                                        <span>{tagName}</span>
                                        {isSelectedInCurrent && <Check size={14} className="ml-0.5 text-white" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            </>
          )}
        </div>

        {/* Drawer Sticky Bottom Bar */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 bg-[var(--pub-bg-alt)]/90 border-t border-[var(--parchment-border)] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xs sm:text-sm font-display font-bold text-[var(--sepia-text)]">
              {t('activeFlavorsSummary')}:
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-extrabold shadow-2xs">
              {totalSelectedCount}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRequestCustomFlavor}
              className="px-3.5 py-2 rounded-lg border border-[var(--parchment-border)] text-xs sm:text-sm font-display uppercase tracking-wider font-semibold text-[var(--sepia-text)] hover:bg-black/5 transition-colors cursor-pointer hidden sm:flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>{t('createCustomFlavor')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-display uppercase tracking-wider font-bold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check size={15} />
              <span>{t('done')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
