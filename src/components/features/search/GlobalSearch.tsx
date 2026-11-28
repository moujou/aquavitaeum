/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, BookOpen, X } from 'lucide-react';
import { db } from '@/lib/db';
import { SpiritType } from '@/types/spirit.types';
import { JournalWithStats } from '@/hooks/useJournals';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { useLanguage } from '@/context/LanguageContext';
import {
  getEffectiveFlavorTaxonomy,
  getStoredCustomFlavors,
  RADAR_DIMENSION_COLORS,
  isCustomFlavorInCategory,
} from '@/data/spirit-flavor-taxonomy';

interface GlobalSearchProps {
  journals: JournalWithStats[];
  activeView?: 'loading' | 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'aroma-catalog' | 'profile';
  setActiveJournalId: (id: string | null) => void;
  setActiveView: (view: 'loading' | 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'aroma-catalog' | 'profile') => void;
  selectSpirit: (id: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  globalTypeFilter?: SpiritType | 'All';
  setGlobalTypeFilter?: (t: SpiritType | 'All') => void;
  onNavigateToSpirit?: (spiritId: string, journalId: string) => void;
  onNavigateToAroma?: (aromaName: string) => void;
}

export default function GlobalSearch({
  journals,
  activeView,
  setActiveJournalId,
  setActiveView,
  selectSpirit,
  globalSearchQuery,
  setGlobalSearchQuery,
  globalTypeFilter,
  onNavigateToSpirit,
  onNavigateToAroma,
}: GlobalSearchProps) {
  const { t, language } = useLanguage();
  const searchRef = useRef<HTMLDivElement>(null);

  const [searchResults, setSearchResults] = useState<{
    journals: { id: string; name: string; coverImage?: string; recentImages?: string[]; bottleCount: number; averageRating: number; description?: string }[];
    spirits: { id: string; name: string; distillery: string; bottler?: string; journalId: string; journalName: string; thumbnailImage?: string; region: string; rating100: number; spiritType: string }[];
    aromas: { id: string; name: string; emoji: string; color: string; categoryName: string; categoryEmoji: string }[];
  }>({ journals: [], spirits: [], aromas: [] });

  // Close search dropdown on click outside when not using live page filtering on the Aroma Catalog view
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeView === 'aroma-catalog') {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-global-search="true"]')) {
        return;
      }
      setGlobalSearchQuery('');
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setGlobalSearchQuery, activeView]);

  // Global search effect
  useEffect(() => {
    if (!globalSearchQuery.trim() || activeView === 'aroma-catalog') {
      const timer = setTimeout(() => {
        setSearchResults({ journals: [], spirits: [], aromas: [] });
      }, 0);
      return () => clearTimeout(timer);
    }

    let isMounted = true;
    const query = globalSearchQuery.trim().toLowerCase();

    async function performGlobalSearch() {
      try {
        const matchingJournals = journals
          .filter(j => j.name.toLowerCase().includes(query) || (j.description && j.description.toLowerCase().includes(query)))
          .map(j => ({
            id: j.id,
            name: j.name,
            coverImage: j.coverImage,
            recentImages: j.recentImages,
            bottleCount: j.bottleCount,
            averageRating: j.averageRating,
            description: j.description
          }));

        const allSpirits = await db.spirits.toArray();
        const matchingSpirits = allSpirits
          .filter(s => {
            const matchesType = !globalTypeFilter || globalTypeFilter === 'All' || s.spiritType === globalTypeFilter;
            const matchesText = (s.name || '').toLowerCase().includes(query) ||
                                (s.distillery || '').toLowerCase().includes(query) ||
                                (s.bottler || '').toLowerCase().includes(query) ||
                                (s.region || '').toLowerCase().includes(query) ||
                                (s.spiritType || '').toLowerCase().includes(query) ||
                                (s.noseFlavorTags || []).some(tag => tag.toLowerCase().includes(query)) ||
                                (s.tasteFlavorTags || []).some(tag => tag.toLowerCase().includes(query)) ||
                                (s.flavorTags || []).some(tag => tag.toLowerCase().includes(query));
            return matchesType && matchesText;
          })
          .map(s => {
            const journal = journals.find(j => j.id === s.journalId);
            const targetJournalId = s.journalId || (journals[0]?.id ?? 'default-compendium');
            const targetJournalName = journal ? journal.name : (journals[0]?.name ?? 'My Journal');
            return {
              id: s.id,
              name: s.name,
              distillery: s.distillery,
              bottler: s.bottler,
              journalId: targetJournalId,
              journalName: targetJournalName,
              thumbnailImage: s.thumbnailImage,
              region: s.region,
              rating100: s.rating100,
              spiritType: s.spiritType
            };
          });

        // Search Aromas across effective taxonomy and custom flavors
        const effectiveTaxonomy = getEffectiveFlavorTaxonomy();
        const customFlavors = getStoredCustomFlavors();
        const matchingAromas: {
          id: string;
          name: string;
          emoji: string;
          color: string;
          categoryName: string;
          categoryEmoji: string;
        }[] = [];
        const seenAromaIds = new Set<string>();

        for (const cat of effectiveTaxonomy) {
          const catTitle = cat.name[language] ?? cat.name.EN;
          const catColor = cat.color ?? RADAR_DIMENSION_COLORS[cat.radarDimension] ?? '#C59B27';

          for (const cf of customFlavors) {
            if (!isCustomFlavorInCategory(cf, cat) || seenAromaIds.has(cf.id)) continue;
            const matchesCf =
              cf.name.toLowerCase().includes(query) ||
              (cf.description && cf.description.toLowerCase().includes(query));
            if (matchesCf) {
              seenAromaIds.add(cf.id);
              matchingAromas.push({
                id: cf.id,
                name: cf.name,
                emoji: cf.emoji || cat.emoji,
                color: cf.color || catColor,
                categoryName: catTitle,
                categoryEmoji: cat.emoji,
              });
            }
          }

          for (const sub of cat.subcategories) {
            for (const desc of sub.descriptors) {
              if (seenAromaIds.has(desc.id)) continue;
              const matchesDesc =
                desc.name.EN.toLowerCase().includes(query) ||
                desc.name.DE.toLowerCase().includes(query) ||
                desc.id.toLowerCase().includes(query) ||
                (desc.description && desc.description.toLowerCase().includes(query)) ||
                (desc.aliases || []).some((a) => a.toLowerCase().includes(query));
              if (matchesDesc) {
                seenAromaIds.add(desc.id);
                matchingAromas.push({
                  id: desc.id,
                  name: desc.name[language] ?? desc.name.EN,
                  emoji: desc.emoji || cat.emoji,
                  color: desc.color || catColor,
                  categoryName: catTitle,
                  categoryEmoji: cat.emoji,
                });
              }
            }
          }
        }

        matchingAromas.sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(query) ? 0 : 1;
          const bStarts = b.name.toLowerCase().startsWith(query) ? 0 : 1;
          if (aStarts !== bStarts) return aStarts - bStarts;
          return a.name.localeCompare(b.name);
        });

        if (isMounted) {
          setSearchResults({
            journals: matchingJournals,
            spirits: matchingSpirits,
            aromas: matchingAromas.slice(0, 10),
          });
        }
      } catch (err) {
        console.error('Failed to perform global search:', err);
      }
    }

    performGlobalSearch();
    return () => { isMounted = false; };
  }, [globalSearchQuery, globalTypeFilter, journals, activeView, language]);

  const handleSelectSpirit = (spiritId: string, journalId: string) => {
    if (onNavigateToSpirit) {
      onNavigateToSpirit(spiritId, journalId);
    } else {
      setActiveJournalId(journalId);
      selectSpirit(spiritId);
      setActiveView('journal-detail');
      setGlobalSearchQuery('');
    }
  };

  const handleSelectJournal = (journalId: string) => {
    setActiveJournalId(journalId);
    setActiveView('journal-landing');
    setGlobalSearchQuery('');
  };

  const handleSelectAroma = (aromaName: string) => {
    if (onNavigateToAroma) {
      onNavigateToAroma(aromaName);
    } else {
      setGlobalSearchQuery(aromaName);
      setActiveView('aroma-catalog');
    }
  };

  return (
    <div ref={searchRef} data-global-search="true" className="relative w-full z-40">
      {/* Modern Pill Search Input Bar with Clover Green Accents */}
      <div className="relative flex items-center bg-[var(--pub-bg-panel)]/95 hover:bg-[var(--pub-bg-panel)] focus-within:bg-[var(--pub-bg-panel)] border-[1.5px] border-[var(--forest-green)]/45 focus-within:border-[var(--forest-green)] rounded-full px-4 h-11 transition-[border-color,box-shadow] duration-150 shadow-xs focus-within:shadow-[0_2px_14px_rgba(46,148,93,0.20)]">
        <Search size={17} className="text-[var(--forest-green)] mr-3 flex-shrink-0" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          placeholder={t('searchPlaceholderGlobal')}
          className="bg-transparent border-none text-sm text-[var(--foreground)] placeholder:text-[var(--placeholder-text)] focus:outline-none focus:ring-0 focus-within:ring-0 w-full font-body"
        />
        {globalSearchQuery && (
          <button
            type="button"
            onClick={() => setGlobalSearchQuery('')}
            title={t('clearSearch')}
            aria-label={t('clearSearch')}
            className="ml-2 p-1 rounded-full hover:bg-black/10 text-[var(--sepia-muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer shrink-0"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Search Results Dropdown (hidden when live-filtering on Aroma Catalog view) */}
      {globalSearchQuery.trim() !== '' && activeView !== 'aroma-catalog' && (
        <div className="absolute top-13 left-0 right-0 bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl z-50 p-2.5 max-h-[380px] overflow-y-auto divide-y divide-[var(--parchment-divider)] animate-fade-in">
          {searchResults.journals.length === 0 && searchResults.spirits.length === 0 && searchResults.aromas.length === 0 ? (
            <p className="text-center text-xs text-[var(--sepia-muted)] py-4 italic">
              {t('noMatchesFound')}
            </p>
          ) : (
            <>
              {searchResults.journals.length > 0 && (
                <div className="py-1">
                  <p className="text-[10px] uppercase font-bold text-[var(--forest-green)] tracking-wider px-2 mb-1.5">{t('journalsHeading')}</p>
                  {searchResults.journals.map(j => {
                    const hasCover = j.coverImage && j.coverImage.trim() !== '';
                    return (
                      <a
                        key={j.id}
                        href={`#journal-${j.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectJournal(j.id);
                        }}
                        className="w-full text-left text-xs text-[var(--foreground)] hover:bg-black/5 p-3 rounded-lg transition-all flex items-center gap-4.5 cursor-pointer group min-h-[84px] block no-underline"
                      >
                        {/* Left Column: Cover Image / Icon */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-14 text-center">
                          {hasCover ? (
                            <img
                              src={j.coverImage}
                              alt=""
                              className="w-14 h-14 rounded-md object-cover border border-[var(--parchment-border)] shadow-xs"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-md border border-[var(--parchment-border)] flex items-center justify-center bg-[var(--forest-green)]/10 text-[var(--forest-green)] shadow-xs">
                              <BookOpen size={24} />
                            </div>
                          )}
                          {j.averageRating > 0 && (
                            <div className="flex items-center gap-0.5 text-[var(--brass-accent)] font-black text-[12px] sm:text-[13px] mt-1.5 select-none leading-none">
                              <Star size={12} className="fill-[var(--brass-accent)] text-[var(--brass-accent)] shrink-0" />
                              <span>{j.averageRating}</span>
                            </div>
                          )}
                        </div>

                        {/* Right Column: Text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                          <p className="font-display font-bold text-[14px] sm:text-[15px] text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors truncate">
                            {j.name}
                          </p>
                          <p className="font-body text-[12px] text-[var(--sepia-muted)] line-clamp-1 italic mt-0.5">
                            {j.description || t('noDescriptionProvided')}
                          </p>
                          <p className="text-[11px] text-[var(--sepia-muted)]/70 truncate mt-0.5">
                            {j.bottleCount} {j.bottleCount === 1 ? 'Note' : 'Notes'}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              {searchResults.spirits.length > 0 && (
                <div className="py-1">
                  <p className="text-[10px] uppercase font-bold text-[var(--forest-green)] tracking-wider px-2 mb-1.5">{t('spiritsHeading')}</p>
                  {searchResults.spirits.map(s => {
                    const hasImg = s.thumbnailImage && s.thumbnailImage.trim() !== '';
                    return (
                      <a
                        key={s.id}
                        href={`#spirit-${s.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          handleSelectSpirit(s.id, s.journalId);
                        }}
                        className="w-full text-left text-xs text-[var(--foreground)] hover:bg-black/5 p-3 rounded-lg transition-all flex items-center gap-4.5 cursor-pointer group min-h-[84px] block no-underline"
                      >
                        {/* Left Column: Image & Rating */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-14 text-center">
                          {hasImg && s.thumbnailImage ? (
                            <img
                              src={s.thumbnailImage}
                              alt=""
                              className="w-14 h-14 rounded-md object-cover border border-[var(--parchment-border)]"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-md border border-[var(--parchment-border)] flex items-center justify-center bg-[var(--pub-bg-alt)]">
                              <WhiskyLogo size={22} className="text-[var(--forest-green)]" />
                            </div>
                          )}
                          <div className="flex items-center gap-0.5 text-[var(--brass-accent)] font-black text-[12px] sm:text-[13px] mt-1.5 select-none leading-none">
                            <Star size={12} className="fill-[var(--brass-accent)] text-[var(--brass-accent)] shrink-0" />
                            <span>{s.rating100}</span>
                          </div>
                        </div>

                        {/* Right Column: Text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                          <p className="font-display font-bold text-[14px] sm:text-[15px] text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors truncate">
                            {s.name}
                          </p>
                          <p className="font-body text-[12px] text-[var(--sepia-muted)] line-clamp-1 italic mt-0.5">
                            {[s.distillery, s.bottler && s.bottler.toLowerCase() !== s.distillery.toLowerCase() ? s.bottler : null, s.region].filter(Boolean).join(' • ')} ({s.spiritType})
                          </p>
                          <p className="text-[11px] text-[var(--forest-green)] font-medium truncate mt-0.5">
                            {t('inJournalPrefix')} {s.journalName}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              {searchResults.aromas.length > 0 && (
                <div className="py-1">
                  <p className="text-[10px] uppercase font-bold text-[var(--forest-green)] tracking-wider px-2 mb-1.5">
                    {t('aromasHeading')}
                  </p>
                  {searchResults.aromas.map((a) => (
                    <a
                      key={a.id}
                      href={`#aroma-${a.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSelectAroma(a.name);
                      }}
                      className="w-full text-left text-xs text-[var(--foreground)] hover:bg-black/5 px-3 py-2.5 rounded-lg transition-all flex items-center gap-3.5 cursor-pointer group block no-underline"
                    >
                      <div className="w-10 h-10 rounded-lg border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/60 flex items-center justify-center shrink-0 text-lg select-none shadow-2xs">
                        {a.emoji}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-display font-bold text-[14px] text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors truncate">
                            {a.name}
                          </span>
                          <span
                            className="w-3.5 h-3.5 rounded-md border border-black/20 dark:border-white/25 shadow-2xs shrink-0"
                            style={{ backgroundColor: a.color }}
                          />
                        </div>
                        <span className="font-body text-[11px] text-[var(--sepia-muted)] truncate mt-0.5">
                          {a.categoryEmoji} {a.categoryName}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
