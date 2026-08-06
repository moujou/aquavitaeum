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
      <div className="flex items-center justify-between border-b border-[#C4A87A]/50 pb-1">
        <SectionHeader>{t('activeFlavors')}</SectionHeader>

        {/* Sensory Layer Toggle Switch (Right end of header) */}
        {!isLegacyMode && (
          <div className="flex items-center p-0.5 rounded-sm bg-[#1A120B]/10 border border-[#C4A87A]/80 shrink-0">
            <button
              type="button"
              onClick={() => setActiveSensoryMode('nose')}
              className={cn(
                'px-3 py-1.5 text-xs font-body font-bold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer',
                activeSensoryMode === 'nose'
                  ? 'bg-[#C59B27] text-[#1A120B] shadow-xs'
                  : 'text-[#5c3d22] hover:text-[#1A120B]',
              )}
              aria-pressed={activeSensoryMode === 'nose'}
            >
              <span>{noseLabel}</span>
              {noseFlavorTags.length > 0 && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 text-[10px] font-extrabold rounded-full',
                    activeSensoryMode === 'nose'
                      ? 'bg-[#1A120B]/20 text-[#1A120B]'
                      : 'bg-[#C59B27] text-[#1A120B]',
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
                'px-3 py-1.5 text-xs font-body font-bold rounded-xs transition-all flex items-center gap-1.5 cursor-pointer',
                activeSensoryMode === 'taste'
                  ? 'bg-[#2A5E3F] text-white shadow-xs'
                  : 'text-[#5c3d22] hover:text-[#1A120B]',
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
                      : 'bg-[#2A5E3F] text-white',
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
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#755030] pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'DE' ? 'Aromen durchsuchen…' : 'Search flavor descriptors…'}
          className="w-full bg-[#1A120B]/5 border border-[#C4A87A] rounded-sm pl-9 pr-3 py-1.5 text-xs sm:text-sm text-[#1A120B] placeholder:text-[#755030]/70 font-body focus:outline-none focus:border-[#5c3d22] transition-colors"
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
              className="border border-[#D4C3A3]/80 rounded-sm bg-[#1A120B]/5 overflow-hidden transition-all"
            >
              {/* Category Header Bar */}
              <button
                type="button"
                onClick={() => toggleCategory(category.id, isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-[#1A120B]/10 transition-colors cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{category.emoji}</span>
                  <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-[#5c3d22]">
                    {categoryName}
                  </span>
                  {activeCountInCat > 0 && (
                    <span className="px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-[#3D2616] text-[#F5EEDC]">
                      {activeCountInCat}
                    </span>
                  )}
                </div>
                <div className="text-[#755030]">
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>

              {/* Collapsible Content */}
              {isOpen && (
                <div className="p-3 border-t border-[#D4C3A3]/60 flex flex-col gap-3 bg-transparent">
                  {subcategoriesToDisplay.map((sub) => {
                    const subName = sub.name[language] ?? sub.name.EN;
                    const descriptors = sub.matchingDescriptors;

                    return (
                      <div key={sub.id} className="flex flex-col gap-1.5">
                        <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#755030] font-body">
                          {subName}
                        </p>

                        <div className="flex flex-wrap gap-1.5">
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
                                  'px-2.5 py-1 rounded-sm border text-xs sm:text-[13px] font-medium font-body transition-all duration-150 cursor-pointer select-none',
                                  selectedInCurrent
                                    ? activeSensoryMode === 'nose' && !isLegacyMode
                                      ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] shadow-xs font-semibold'
                                      : 'bg-[#1E3A2B] border-[#4A7C59] text-[#F5EEDC] shadow-xs font-semibold'
                                    : selectedInOther
                                    ? activeSensoryMode === 'nose'
                                      ? 'bg-[#2A5E3F]/15 border-[#2A5E3F]/60 text-[#1E3A2B] font-semibold'
                                      : 'bg-[#C59B27]/20 border-[#C59B27]/80 text-[#3D2616] font-semibold'
                                    : 'bg-transparent border-[#C4A87A]/60 text-[#5c3d22] hover:bg-[#1A120B]/10 hover:border-[#C59B27]',
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
        <div className="mt-1 pt-3 border-t border-[#C4A87A] flex flex-col gap-2">
          <SectionHeader>
            {language === 'DE' ? 'Aktive Aromen' : 'Active Flavors'} ({totalActiveCount})
          </SectionHeader>

          {isLegacyMode ? (
            <p className="text-xs sm:text-sm text-[#1A120B] font-body italic leading-relaxed">
              {selectedTags.map((tag) => translateFlavorTag(tag, language)).join(' · ')}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5 text-xs sm:text-sm font-body">
              {noseFlavorTags.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-[#755030] uppercase tracking-wider text-[11px]">
                    {language === 'DE' ? 'Nase:' : 'Nose Flavors:'}
                  </span>
                  <span className="text-[#1A120B] italic">
                    {noseFlavorTags.map((tag) => translateFlavorTag(tag, language)).join(' · ')}
                  </span>
                </div>
              )}

              {tasteFlavorTags.length > 0 && (
                <div className="flex flex-wrap items-baseline gap-1.5">
                  <span className="font-bold text-[#2A5E3F] uppercase tracking-wider text-[11px]">
                    {language === 'DE' ? 'Geschmack:' : 'Taste Flavors:'}
                  </span>
                  <span className="text-[#1A120B] italic">
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
