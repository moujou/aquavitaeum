'use client';

import { useState } from 'react';
import { Compass, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  FlavorDescriptor,
  translateFlavorTag,
  getStoredCustomFlavors,
  registerCustomFlavor,
  deleteStoredCustomFlavor,
  findFlavorDescriptor,
  RADAR_DIMENSION_COLORS,
} from '@/data/spirit-flavor-taxonomy';
import { CustomFlavorDescriptor } from '@/types/spirit.types';
import { CustomFlavorModal } from '@/components/features/flavor-tags/CustomFlavorModal';
import { SpotlightFlavorSearch } from '@/components/features/flavor-tags/SpotlightFlavorSearch';
import { SensoryCompassDrawer } from '@/components/features/flavor-tags/SensoryCompassDrawer';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

export type SensoryMode = 'nose' | 'taste';

interface FlavorTagSelectorProps {
  noseFlavorTags?: string[];
  tasteFlavorTags?: string[];
  onNoseTagsChange?: (tags: string[]) => void;
  onTasteTagsChange?: (tags: string[]) => void;
  // Legacy props compatibility
  selectedTags?: string[];
  onChange?: (tags: string[]) => void;
  className?: string;
  spiritId?: string;
}

export function isTagSelected(desc: FlavorDescriptor, selectedTags: string[] = []): boolean {
  if (!selectedTags || selectedTags.length === 0) return false;

  const descEN = desc.name.EN.toLowerCase();
  const descDE = desc.name.DE.toLowerCase();
  const descId = desc.id.toLowerCase();
  const aliases = (desc.aliases || []).map((a) => a.toLowerCase());

  return selectedTags.some((tag) => {
    const t = tag.trim().toLowerCase();
    if (!t) return false;

    return t === descId || t === descEN || t === descDE || aliases.includes(t);
  });
}

export function FlavorTagSelector({
  noseFlavorTags = [],
  tasteFlavorTags = [],
  onNoseTagsChange,
  onTasteTagsChange,
  selectedTags = [],
  onChange,
  className,
}: FlavorTagSelectorProps) {
  const { language, t } = useLanguage();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerSensoryMode, setDrawerSensoryMode] = useState<SensoryMode>('nose');
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customModalInitialName, setCustomModalInitialName] = useState('');
  const [customFlavorsList, setCustomFlavorsList] = useState<CustomFlavorDescriptor[]>(getStoredCustomFlavors());

  const refreshCustomFlavors = () => {
    setCustomFlavorsList([...getStoredCustomFlavors()]);
  };

  const isLegacyMode = onNoseTagsChange === undefined && onChange !== undefined;
  const activeNoseTags = isLegacyMode ? selectedTags : noseFlavorTags;
  const activeTasteTags = isLegacyMode ? [] : tasteFlavorTags;

  const handleToggleNoseTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    const isAlreadySelected = activeNoseTags.some(
      (t) => t.trim().toLowerCase() === trimmed.toLowerCase()
    );

    let nextTags: string[];
    if (isAlreadySelected) {
      nextTags = activeNoseTags.filter(
        (t) => t.trim().toLowerCase() !== trimmed.toLowerCase()
      );
    } else {
      nextTags = [...activeNoseTags, trimmed];
    }

    if (isLegacyMode) {
      onChange?.(nextTags);
    } else {
      onNoseTagsChange?.(nextTags);
    }
  };

  const handleToggleTasteTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;

    const isAlreadySelected = activeTasteTags.some(
      (t) => t.trim().toLowerCase() === trimmed.toLowerCase()
    );

    let nextTags: string[];
    if (isAlreadySelected) {
      nextTags = activeTasteTags.filter(
        (t) => t.trim().toLowerCase() !== trimmed.toLowerCase()
      );
    } else {
      nextTags = [...activeTasteTags, trimmed];
    }

    onTasteTagsChange?.(nextTags);
  };

  const handleSaveCustomFlavor = (flavor: CustomFlavorDescriptor) => {
    registerCustomFlavor(flavor);
    refreshCustomFlavors();

    if (drawerSensoryMode === 'nose' || isLegacyMode) {
      const updatedNose = Array.from(new Set([...activeNoseTags, flavor.name]));
      if (isLegacyMode) onChange?.(updatedNose);
      else onNoseTagsChange?.(updatedNose);
    } else {
      const updatedTaste = Array.from(new Set([...activeTasteTags, flavor.name]));
      onTasteTagsChange?.(updatedTaste);
    }
  };

  const handleDeleteCustomFlavor = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    // 1. Identify all name and ID variants for this custom aroma
    const flavorToDelete = customFlavorsList.find(
      (f) =>
        f.id.toLowerCase() === id.toLowerCase() ||
        f.name.toLowerCase() === id.toLowerCase()
    );

    const namesToRemove = [
      id,
      flavorToDelete?.name,
      flavorToDelete?.id,
      ...(flavorToDelete?.emoji ? [`${flavorToDelete.emoji} ${flavorToDelete.name}`] : []),
    ]
      .filter(Boolean)
      .map((s) => s!.trim().toLowerCase());

    // 2. Delete from persistent storage
    deleteStoredCustomFlavor(id);
    refreshCustomFlavors();

    // 3. Purge deleted flavor from Nose, Taste, and Legacy tag arrays
    const isMatching = (tag: string) => {
      const tLower = tag.trim().toLowerCase();
      return namesToRemove.some((n) => n === tLower || tLower.includes(n) || n.includes(tLower));
    };

    const nextNose = activeNoseTags.filter((t) => !isMatching(t));
    const nextTaste = activeTasteTags.filter((t) => !isMatching(t));

    if (isLegacyMode) {
      onChange?.(nextNose);
    } else {
      if (nextNose.length !== activeNoseTags.length) {
        onNoseTagsChange?.(nextNose);
      }
      if (nextTaste.length !== activeTasteTags.length) {
        onTasteTagsChange?.(nextTaste);
      }
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* ── Section Header & Top Actions Row ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--parchment-border)]/50 pb-2">
        <SectionHeader>{t('activeFlavors')}</SectionHeader>

        {/* Global Toolbar: Open Compass Drawer & Create Custom Aroma */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDrawerSensoryMode('nose');
              setIsDrawerOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--wood-selection)] text-white text-xs font-display font-bold uppercase tracking-wider shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer h-[34px]"
          >
            <Compass size={15} className="text-amber-200" />
            <span>{t('openSensoryDrawer')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCustomModalInitialName('');
              setIsCustomModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg border border-[var(--parchment-border)] bg-[var(--parchment-bg-alt)]/60 text-[var(--foreground)] hover:bg-[var(--parchment-bg-alt)] text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer h-[34px]"
          >
            <Plus size={14} className="text-[var(--wood-selection)]" />
            <span>{t('createCustomFlavor')}</span>
          </button>
        </div>
      </div>

      {/* ── Vertical Stack: Nose Section (Top) & Taste Section (Bottom) ──────── */}
      <div className="flex flex-col gap-4 w-full">
        {/* ── SECTION 1: NOSE SECTION (Warm Amber Accent) ───────────────────── */}
        <div className="p-4 rounded-xl bg-[var(--parchment-bg-alt)]/40 border border-[var(--parchment-border)] flex flex-col gap-3 shadow-2xs">
          {/* Header Title with Sensory Dot Indicator */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--sensory-nose)] shadow-2xs shrink-0" />
              <span className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[var(--foreground)]">
                {t('noseSectionTitle')} ({activeNoseTags.length})
              </span>
            </div>

            {activeNoseTags.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (isLegacyMode) onChange?.([]);
                  else onNoseTagsChange?.([]);
                }}
                className="text-[11px] text-[var(--sepia-muted)] hover:text-red-500 transition-colors font-body cursor-pointer"
              >
                {t('clearAll')}
              </button>
            )}
          </div>

          {/* Dedicated Full-Width Spotlight Search Input for Nose */}
          <SpotlightFlavorSearch
            activeTags={activeNoseTags}
            otherSensoryTags={activeTasteTags}
            activeSensoryMode="nose"
            onToggleTag={handleToggleNoseTag}
            onRequestCustomFlavor={(initial) => {
              setCustomModalInitialName(initial);
              setDrawerSensoryMode('nose');
              setIsCustomModalOpen(true);
            }}
            placeholder={t('searchNosePlaceholder')}
          />

          {/* Active Nose Flavor Badges in Full Category Color */}
          <div className="min-h-[48px] flex flex-wrap gap-1.5 items-start content-start pt-1">
            {activeNoseTags.length > 0 ? (
              activeNoseTags.map((tag) => {
                const desc = findFlavorDescriptor(tag, customFlavorsList);
                const customMatch = customFlavorsList.find(
                  (cf) =>
                    cf.name.toLowerCase() === tag.trim().toLowerCase() ||
                    cf.id.toLowerCase() === tag.trim().toLowerCase()
                );
                const chipColor =
                  customMatch?.color ??
                  desc?.color ??
                  (desc?.radarDimension ? RADAR_DIMENSION_COLORS[desc.radarDimension] : '#C59B27');
                const emoji = customMatch?.emoji;

                return (
                  <div
                    key={tag}
                    className="px-3 py-1.5 rounded-full text-white text-xs sm:text-[13px] font-body font-bold flex items-center gap-1.5 shadow-xs select-none animate-fade-in transition-transform hover:scale-[1.02]"
                    style={{ backgroundColor: chipColor }}
                  >
                    {emoji && <span className="text-sm">{emoji}</span>}
                    <span>{translateFlavorTag(tag, language)}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleNoseTag(tag)}
                      className="ml-0.5 w-4 h-4 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors"
                      title="Remove aroma"
                      aria-label="Remove aroma"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[var(--sepia-muted)] italic font-body py-2">
                {t('noNoseFlavors')}
              </p>
            )}
          </div>
        </div>

        {/* ── SECTION 2: TASTE / PALATE SECTION (Maritime Teal Accent) ──────── */}
        {!isLegacyMode && (
          <div className="p-4 rounded-xl bg-[var(--parchment-bg-alt)]/40 border border-[var(--parchment-border)] flex flex-col gap-3 shadow-2xs">
            {/* Header Title with Sensory Dot Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--sensory-taste)] shadow-2xs shrink-0" />
                <span className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {t('tasteSectionTitle')} ({activeTasteTags.length})
                </span>
              </div>

              {activeTasteTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => onTasteTagsChange?.([])}
                  className="text-[11px] text-[var(--sepia-muted)] hover:text-red-500 transition-colors font-body cursor-pointer"
                >
                  {t('clearAll')}
                </button>
              )}
            </div>

            {/* Dedicated Full-Width Spotlight Search Input for Taste */}
            <SpotlightFlavorSearch
              activeTags={activeTasteTags}
              otherSensoryTags={activeNoseTags}
              activeSensoryMode="taste"
              onToggleTag={handleToggleTasteTag}
              onRequestCustomFlavor={(initial) => {
                setCustomModalInitialName(initial);
                setDrawerSensoryMode('taste');
                setIsCustomModalOpen(true);
              }}
              placeholder={t('searchTastePlaceholder')}
            />

            {/* Active Taste Flavor Badges in Full Category Color */}
            <div className="min-h-[48px] flex flex-wrap gap-1.5 items-start content-start pt-1">
              {activeTasteTags.length > 0 ? (
                activeTasteTags.map((tag) => {
                  const desc = findFlavorDescriptor(tag, customFlavorsList);
                  const customMatch = customFlavorsList.find(
                    (cf) =>
                      cf.name.toLowerCase() === tag.trim().toLowerCase() ||
                      cf.id.toLowerCase() === tag.trim().toLowerCase()
                  );
                  const chipColor =
                    customMatch?.color ??
                    desc?.color ??
                    (desc?.radarDimension ? RADAR_DIMENSION_COLORS[desc.radarDimension] : '#1C6B7D');
                  const emoji = customMatch?.emoji;

                  return (
                    <div
                      key={tag}
                      className="px-3 py-1.5 rounded-full text-white text-xs sm:text-[13px] font-body font-bold flex items-center gap-1.5 shadow-xs select-none animate-fade-in transition-transform hover:scale-[1.02]"
                      style={{ backgroundColor: chipColor }}
                    >
                      {emoji && <span className="text-sm">{emoji}</span>}
                      <span>{translateFlavorTag(tag, language)}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleTasteTag(tag)}
                        className="ml-0.5 w-4 h-4 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors"
                        title="Remove aroma"
                        aria-label="Remove aroma"
                      >
                        ×
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-[var(--sepia-muted)] italic font-body py-2">
                  {t('noTasteFlavors')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Sensory Compass Wheel Drawer Modal ──────────────────────────────────── */}
      <SensoryCompassDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        noseFlavorTags={activeNoseTags}
        tasteFlavorTags={activeTasteTags}
        onNoseTagsChange={isLegacyMode ? onChange : onNoseTagsChange}
        onTasteTagsChange={onTasteTagsChange}
        activeSensoryMode={drawerSensoryMode}
        onSensoryModeChange={setDrawerSensoryMode}
        customFlavors={customFlavorsList}
        onRequestCustomFlavor={() => {
          setCustomModalInitialName('');
          setIsCustomModalOpen(true);
        }}
        onDeleteCustomFlavor={handleDeleteCustomFlavor}
      />

      {/* ── Custom Flavor Creator Modal ────────────────────────────────────────── */}
      <CustomFlavorModal
        isOpen={isCustomModalOpen}
        initialName={customModalInitialName}
        onClose={() => {
          setIsCustomModalOpen(false);
          setCustomModalInitialName('');
        }}
        onSave={handleSaveCustomFlavor}
      />
    </div>
  );
}
