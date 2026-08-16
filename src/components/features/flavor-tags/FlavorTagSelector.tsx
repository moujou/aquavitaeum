'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { SPIRIT_FLAVOR_TAXONOMY, FlavorDescriptor, translateFlavorTag } from '@/data/spirit-flavor-taxonomy';
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
  spiritId,
}: FlavorTagSelectorProps & { spiritId?: string }) {
  const { language, t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSensoryMode, setActiveSensoryMode] = useState<SensoryMode>('nose');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [prevSpiritId, setPrevSpiritId] = useState(spiritId);

  if (prevSpiritId !== spiritId) {
    setPrevSpiritId(spiritId);
    setOpenCategories({});
  }

  const toggleCategory = (catId: string, currentIsOpen: boolean) => {
    setOpenCategories((prev) => ({
      ...prev,
      [catId]: !currentIsOpen,
    }));
  };

  const isLegacyMode = onNoseTagsChange === undefined && onChange !== undefined;
  const currentActiveTags = isLegacyMode
    ? selectedTags
    : activeSensoryMode === 'nose'
    ? noseFlavorTags
    : tasteFlavorTags;

  const handleDescriptorClick = (desc: FlavorDescriptor) => {
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

        const matches =
          tLower === descId ||
          tLower === descEN ||
          tLower === descDE ||
          aliases.includes(tLower) ||
          descEN.includes(tLower) ||
          descDE.includes(tLower) ||
          tLower.includes(descEN) ||
          tLower.includes(descDE) ||
          aliases.some((alias) => alias.includes(tLower) || tLower.includes(alias));

        return !matches;
      });
    } else {
      updatedTags = [...currentActiveTags, primaryName];
    }

    if (isLegacyMode) {
      onChange?.(updatedTags);
    } else if (activeSensoryMode === 'nose') {
      onNoseTagsChange?.(updatedTags);
    } else {
      onTasteTagsChange?.(updatedTags);
    }
  };

  const isSearching = searchQuery.trim().length > 0;
  const queryLower = searchQuery.toLowerCase();

  const noseLabel = language === 'DE' ? 'Nase' : 'Nose';
  const tasteLabel = language === 'DE' ? 'Geschmack' : 'Taste';

  const totalActiveCount = isLegacyMode
    ? selectedTags.length
    : noseFlavorTags.length + tasteFlavorTags.length;

  return (
    <div className={cn('flex flex-col gap-3.5', className)}>
      {/* ── Section Title Header (Left) & Mode Switch (Right) ────────────────────── */}
      <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1">
        <SectionHeader>{t('activeFlavors')}</SectionHeader>

        {/* Sensory Layer Toggle Switch (Right end of header) */}
        {!isLegacyMode && (
          <div className="flex items-center p-0.5 rounded-sm bg-[var(--sepia-text)]/10 border border-[var(--parchment-border)]/80 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSensoryMode('nose')}
              className={cn(
                'px-3 py-1.5 text-xs sm:text-sm font-body font-bold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer',
                activeSensoryMode === 'nose'
                  ? 'bg-[var(--sensory-nose)] text-[var(--parchment-bg)] shadow-xs'
                  : 'text-[var(--sepia-muted)] hover:text-[var(--sepia-text)]',
              )}
              aria-pressed={activeSensoryMode === 'nose'}
            >
              <span>{noseLabel}</span>
              {noseFlavorTags.length > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] font-extrabold rounded-full',
                    activeSensoryMode === 'nose'
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--sensory-nose)] text-[var(--parchment-bg)]',
                  )}
                >
                  {noseFlavorTags.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveSensoryMode('taste')}
              className={cn(
                'px-3 py-1.5 text-xs sm:text-sm font-body font-bold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer',
                activeSensoryMode === 'taste'
                  ? 'bg-[var(--sensory-taste)] text-[var(--parchment-bg)] shadow-xs'
                  : 'text-[var(--sepia-muted)] hover:text-[var(--sepia-text)]',
              )}
              aria-pressed={activeSensoryMode === 'taste'}
            >
              <span>{tasteLabel}</span>
              {tasteFlavorTags.length > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] font-extrabold rounded-full',
                    activeSensoryMode === 'taste'
                      ? 'bg-white/20 text-white'
                      : 'bg-[var(--sensory-taste)] text-[var(--parchment-bg)]',
                  )}
                >
                  {tasteFlavorTags.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Full-width Search Bar */}
      <div className="relative w-full">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sepia-light)] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'DE' ? 'Aromen durchsuchen…' : 'Search flavor descriptors…'}
          className="w-full bg-[var(--sepia-text)]/5 border border-[var(--parchment-border)] rounded-sm pl-9 pr-3 py-1.5 text-xs sm:text-sm text-[var(--sepia-text)] placeholder:text-[var(--sepia-light)]/70 font-body focus:outline-none focus:border-[var(--sepia-muted)] transition-colors"
        />
      </div>

      {/* Spirit Flavor Taxonomy Categories */}
      <div className="flex flex-col gap-2">
        {SPIRIT_FLAVOR_TAXONOMY.map((category) => {
          const categoryName = category.name[language] ?? category.name.EN;
          
          const activeCountInCat = category.subcategories.flatMap((s) => s.descriptors).filter((d) =>
            isTagSelected(d, currentActiveTags),
          ).length;

          const catNameEN = category.name.EN.toLowerCase();
          const catNameDE = category.name.DE.toLowerCase();
          const catMatches = catNameEN.includes(queryLower) || catNameDE.includes(queryLower);

          const matchingSubcategories = category.subcategories.map((sub) => {
            const subNameEN = sub.name.EN.toLowerCase();
            const subNameDE = sub.name.DE.toLowerCase();
            const subNameCurrent = (sub.name[language] ?? sub.name.EN).toLowerCase();

            const matchingDescriptors = sub.descriptors.filter((d) => {
              const descEN = d.name.EN.toLowerCase();
              const descDE = d.name.DE.toLowerCase();
              const aliases = (d.aliases || []).join(' ').toLowerCase();

              return (
                catMatches ||
                descEN.includes(queryLower) ||
                descDE.includes(queryLower) ||
                subNameEN.includes(queryLower) ||
                subNameDE.includes(queryLower) ||
                subNameCurrent.includes(queryLower) ||
                aliases.includes(queryLower)
              );
            });
            return { ...sub, matchingDescriptors };
          }).filter((sub) => sub.matchingDescriptors.length > 0);

          if (isSearching && matchingSubcategories.length === 0) {
            return null;
          }

          const userSetState = openCategories[category.id];
          const isOpen = isSearching || (userSetState !== undefined ? userSetState : activeCountInCat > 0);

          const subcategoriesToDisplay = isSearching
            ? matchingSubcategories
            : category.subcategories.map((sub) => ({ ...sub, matchingDescriptors: sub.descriptors }));

          return (
            <div
              key={category.id}
              className="border border-[var(--parchment-divider)]/80 rounded-sm bg-[var(--sepia-text)]/5 overflow-hidden transition-all"
            >
              {/* Category Header Bar */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id, isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[var(--sepia-text)]/10 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{category.emoji}</span>
                  <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--sepia-muted)]">
                    {categoryName}
                  </span>
                  {activeCountInCat > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 text-[11px] font-bold rounded-full text-[var(--parchment-bg)]',
                        activeSensoryMode === 'nose'
                          ? 'bg-[var(--sensory-nose)]'
                          : 'bg-[var(--sensory-taste)]',
                      )}
                    >
                      {activeCountInCat}
                    </span>
                  )}
                </div>
                <div className="text-[var(--sepia-light)]">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="p-3 border-t border-[var(--parchment-divider)]/60 flex flex-col gap-3 bg-transparent">
                  {subcategoriesToDisplay.map((sub) => {
                    const subName = sub.name[language] ?? sub.name.EN;
                    const descriptors = sub.matchingDescriptors;

                    return (
                      <div key={sub.id} className="flex flex-col gap-1.5">
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[var(--sepia-light)] font-body">
                          {subName}
                        </p>

                        <div className="flex flex-wrap gap-2 sm:gap-1.5">
                          {descriptors.map((desc: FlavorDescriptor) => {
                            const tagName = desc.name[language] ?? desc.name.EN;
                            const selectedInCurrent = isTagSelected(desc, currentActiveTags);
                            const selectedInOther =
                              !selectedInCurrent &&
                              !isLegacyMode &&
                              isTagSelected(desc, activeSensoryMode === 'nose' ? tasteFlavorTags : noseFlavorTags);

                            return (
                              <button
                                key={desc.id}
                                id={`flavor-tag-${desc.id}`}
                                type="button"
                                onClick={() => handleDescriptorClick(desc)}
                                className={cn(
                                  'px-3 py-2 sm:px-3 sm:py-1.5 rounded-sm border text-xs sm:text-sm font-medium font-body transition-all duration-150 cursor-pointer select-none min-h-[36px]',
                                  selectedInCurrent
                                    ? activeSensoryMode === 'nose' && !isLegacyMode
                                      ? 'bg-[var(--sensory-nose)] border-[var(--sensory-nose)] text-[var(--parchment-bg)] shadow-xs font-semibold'
                                      : 'bg-[var(--sensory-taste)] border-[var(--sensory-taste)] text-[var(--parchment-bg)] shadow-xs font-semibold'
                                    : selectedInOther
                                    ? activeSensoryMode === 'nose'
                                      ? 'bg-[var(--sensory-taste)]/15 border-[var(--sensory-taste)]/60 text-[var(--sensory-taste)] font-semibold'
                                      : 'bg-[var(--sensory-nose)]/15 border-[var(--sensory-nose)]/60 text-[var(--sensory-nose)] font-semibold'
                                    : 'bg-transparent border-[var(--parchment-border)]/60 text-[var(--sepia-muted)] hover:bg-[var(--sepia-text)]/10 hover:border-[var(--brass-accent)]',
                                )}
                                aria-pressed={selectedInCurrent}
                              >
                                {tagName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Active Flavors Summary */}
      {totalActiveCount > 0 && (
        <div className="mt-2 p-3.5 sm:p-4 rounded-lg bg-[var(--pub-bg-alt)]/40 border border-[var(--parchment-border)]/80 flex flex-col gap-2.5 animate-fade-in">
          <SectionHeader>
            {language === 'DE' ? 'Aktive Aromen' : 'Active Flavors'} ({totalActiveCount})
          </SectionHeader>

          {isLegacyMode ? (
            <p className="text-sm sm:text-base text-[var(--sepia-text)] font-serif italic leading-relaxed">
              {selectedTags.map((tag) => translateFlavorTag(tag, language)).join(' · ')}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {noseFlavorTags.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display font-bold text-[var(--sensory-nose)] uppercase tracking-wider text-xs sm:text-sm shrink-0">
                    {language === 'DE' ? 'Nase:' : 'Nose Flavors:'}
                  </span>
                  <span className="text-sm sm:text-base text-[var(--sepia-text)] font-serif italic leading-relaxed">
                    {noseFlavorTags.map((tag) => translateFlavorTag(tag, language)).join(' · ')}
                  </span>
                </div>
              )}

              {tasteFlavorTags.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-display font-bold text-[var(--sensory-taste)] uppercase tracking-wider text-xs sm:text-sm shrink-0">
                    {language === 'DE' ? 'Geschmack:' : 'Taste Flavors:'}
                  </span>
                  <span className="text-sm sm:text-base text-[var(--sepia-text)] font-serif italic leading-relaxed">
                    {tasteFlavorTags.map((tag) => translateFlavorTag(tag, language)).join(' · ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
