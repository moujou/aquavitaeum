/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, SlidersHorizontal, BookOpen } from 'lucide-react';
import { db } from '@/lib/db';
import { SpiritType, SPIRIT_TYPES } from '@/types/spirit.types';
import { JournalWithStats } from '@/hooks/useJournals';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { cn } from '@/lib/utils';

interface GlobalSearchProps {
  journals: JournalWithStats[];
  setActiveJournalId: (id: string | null) => void;
  setActiveView: (view: 'loading' | 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile') => void;
  selectSpirit: (id: string) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  globalTypeFilter: SpiritType | 'All';
  setGlobalTypeFilter: (t: SpiritType | 'All') => void;
  onNavigateToSpirit?: (spiritId: string, journalId: string) => void;
}

export default function GlobalSearch({
  journals,
  setActiveJournalId,
  setActiveView,
  selectSpirit,
  globalSearchQuery,
  setGlobalSearchQuery,
  globalTypeFilter,
  setGlobalTypeFilter,
  onNavigateToSpirit,
}: GlobalSearchProps) {
  const searchRef = useRef<HTMLDivElement>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [searchResults, setSearchResults] = useState<{
    journals: { id: string; name: string; coverImage?: string; recentImages?: string[]; bottleCount: number; averageRating: number; description?: string }[];
    spirits: { id: string; name: string; distillery: string; journalId: string; journalName: string; thumbnailImage?: string; region: string; rating100: number; spiritType: string }[];
  }>({ journals: [], spirits: [] });

  // Close search dropdown on click outside, immune to multi-instance desktop/mobile cross-firing
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('[data-global-search="true"]')) {
        return;
      }
      setGlobalSearchQuery('');
      setIsFilterDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setGlobalSearchQuery]);

  // Global search effect
  useEffect(() => {
    if (!globalSearchQuery.trim()) {
      const timer = setTimeout(() => {
        setSearchResults({ journals: [], spirits: [] });
      }, 0);
      return () => clearTimeout(timer);
    }

    let isMounted = true;
    const query = globalSearchQuery.toLowerCase();

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
            const matchesType = globalTypeFilter === 'All' || s.spiritType === globalTypeFilter;
            const matchesText = s.name.toLowerCase().includes(query) ||
                                s.distillery.toLowerCase().includes(query) ||
                                s.region.toLowerCase().includes(query) ||
                                s.spiritType.toLowerCase().includes(query);
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
              journalId: targetJournalId,
              journalName: targetJournalName,
              thumbnailImage: s.thumbnailImage,
              region: s.region,
              rating100: s.rating100,
              spiritType: s.spiritType
            };
          });

        if (isMounted) {
          setSearchResults({ journals: matchingJournals, spirits: matchingSpirits });
        }
      } catch (err) {
        console.error('Failed to perform global search:', err);
      }
    }

    performGlobalSearch();
    return () => { isMounted = false; };
  }, [globalSearchQuery, globalTypeFilter, journals]);

  const handleSelectSpirit = (spiritId: string, journalId: string) => {
    if (onNavigateToSpirit) {
      onNavigateToSpirit(spiritId, journalId);
    } else {
      setActiveJournalId(journalId);
      selectSpirit(spiritId);
      setActiveView('journal-detail');
      setGlobalSearchQuery('');
    }
    setIsFilterDropdownOpen(false);
  };

  const handleSelectJournal = (journalId: string) => {
    setActiveJournalId(journalId);
    setActiveView('journal-landing');
    setGlobalSearchQuery('');
    setIsFilterDropdownOpen(false);
  };

  return (
    <div ref={searchRef} data-global-search="true" className="relative w-full z-40">
      {/* Modern Pill Search Input Bar with Clover Green Accents */}
      <div className="relative flex items-center bg-[var(--pub-bg-panel)]/95 hover:bg-[var(--pub-bg-panel)] focus-within:bg-[var(--pub-bg-panel)] border-[1.5px] border-[var(--forest-green)]/45 focus-within:border-[var(--forest-green)] rounded-full px-4 h-11 transition-all duration-200 shadow-xs focus-within:shadow-[0_2px_14px_rgba(46,148,93,0.20)]">
        <Search size={17} className="text-[var(--forest-green)] mr-3 flex-shrink-0" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          placeholder="Search spirits & journals..."
          className="bg-transparent border-none text-sm text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/70 focus:outline-none focus:ring-0 focus-within:ring-0 w-full pr-10 font-body"
        />

        {/* Filter Popover Trigger */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center border transition-all cursor-pointer",
              isFilterDropdownOpen
                ? "bg-[var(--forest-green)]/20 border-[var(--forest-green)]/40 text-[var(--forest-green)] shadow-xs"
                : globalTypeFilter !== 'All'
                  ? "bg-[var(--forest-green)]/15 border-[var(--forest-green)] text-[var(--forest-green)] shadow-xs"
                  : "border-transparent text-[var(--forest-green)] hover:bg-[var(--forest-green)]/15 hover:border-[var(--forest-green)]/30"
            )}
            title="Filter by Spirit Type"
          >
            <SlidersHorizontal size={14} />
          </button>

          {/* Active filter badge dot */}
          {globalTypeFilter !== 'All' && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--forest-green)] ring-2 ring-[var(--pub-bg-panel)]" />
          )}
        </div>
      </div>

      {/* Filter Dropdown Popover */}
      {isFilterDropdownOpen && (
        <div className="absolute top-13 right-0 bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-2xl shadow-xl z-50 p-1.5 w-52 max-h-[280px] overflow-y-auto divide-y divide-[var(--parchment-divider)]/50 scrollbar-thin animate-fade-in">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[var(--forest-green)] tracking-wider">
            Filter by Type
          </div>
          <button
            type="button"
            onClick={() => { setGlobalTypeFilter('All'); setIsFilterDropdownOpen(false); }}
            className={cn(
              "w-full text-left text-xs px-3.5 py-2 rounded-lg flex items-center transition-colors cursor-pointer",
              globalTypeFilter === 'All'
                ? "text-[var(--forest-green)] font-semibold bg-[var(--forest-green)]/10 border-l-2 border-[var(--forest-green)] pl-3"
                : "text-[var(--foreground)] hover:bg-black/5"
            )}
          >
            All Spirits
          </button>
          {SPIRIT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => { setGlobalTypeFilter(type); setIsFilterDropdownOpen(false); }}
              className={cn(
                "w-full text-left text-xs px-3.5 py-2 rounded-lg flex items-center transition-colors cursor-pointer",
                globalTypeFilter === type
                  ? "text-[var(--forest-green)] font-semibold bg-[var(--forest-green)]/10 border-l-2 border-[var(--forest-green)] pl-3"
                  : "text-[var(--foreground)] hover:bg-black/5"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Search Results Dropdown */}
      {globalSearchQuery.trim() !== '' && (
        <div className="absolute top-13 left-0 right-0 bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl z-50 p-2.5 max-h-[380px] overflow-y-auto divide-y divide-[var(--parchment-divider)] animate-fade-in">
          {searchResults.journals.length === 0 && searchResults.spirits.length === 0 ? (
            <p className="text-center text-xs text-[var(--sepia-muted)] py-4 italic">
              No matches found.
            </p>
          ) : (
            <>
              {searchResults.journals.length > 0 && (
                <div className="py-1">
                  <p className="text-[10px] uppercase font-bold text-[var(--forest-green)] tracking-wider px-2 mb-1.5">Journals</p>
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
                            {j.description || 'No description provided.'}
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
                  <p className="text-[10px] uppercase font-bold text-[var(--forest-green)] tracking-wider px-2 mb-1.5">Spirits</p>
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
                            {s.distillery} • {s.region} ({s.spiritType})
                          </p>
                          <p className="text-[11px] text-[var(--forest-green)] font-medium truncate mt-0.5">
                            In {s.journalName}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
