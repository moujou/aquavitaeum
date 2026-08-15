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
}: GlobalSearchProps) {
  const searchRef = useRef<HTMLDivElement>(null);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const [searchResults, setSearchResults] = useState<{
  journals: { id: string; name: string; coverImage?: string; recentImages?: string[]; bottleCount: number; averageRating: number; description?: string }[];
    spirits: { id: string; name: string; distillery: string; journalId: string; journalName: string; thumbnailImage?: string; region: string; rating100: number; spiritType: string }[];
  }>({ journals: [], spirits: [] });

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setGlobalSearchQuery('');
        setIsFilterDropdownOpen(false);
      }
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
            return {
              id: s.id,
              name: s.name,
              distillery: s.distillery,
              journalId: s.journalId,
              journalName: journal ? journal.name : 'Unknown Journal',
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

  return (
    <div ref={searchRef} className="relative w-full z-40">
      {/* Modern Pill Search Input Bar */}
      <div className="relative flex items-center bg-[var(--pub-bg-panel)]/95 hover:bg-[var(--pub-bg-panel)] focus-within:bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] focus-within:border-[var(--brass-accent)] rounded-full px-4 h-11 transition-all duration-200 shadow-xs focus-within:shadow-[0_2px_12px_rgba(201,122,30,0.12)]">
        <Search size={17} className="text-[var(--sepia-muted)] mr-3 flex-shrink-0" />
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
              "h-8 w-8 rounded-full flex items-center justify-center border border-transparent transition-all cursor-pointer",
              isFilterDropdownOpen
                ? "bg-[var(--brass-accent)]/20 border-[var(--brass-accent)]/40 text-[var(--brass-accent)]"
                : globalTypeFilter !== 'All'
                  ? "bg-[var(--brass-accent)]/15 border-[var(--brass-accent)] text-[var(--brass-accent)]"
                  : "text-[var(--sepia-muted)] hover:text-[var(--brass-accent)] hover:bg-[var(--brass-accent)]/10"
            )}
            title="Filter by Spirit Type"
          >
            <SlidersHorizontal size={14} />
          </button>

          {/* Active filter badge dot */}
          {globalTypeFilter !== 'All' && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--brass-accent)] ring-2 ring-[var(--pub-bg-panel)]" />
          )}
        </div>
      </div>

      {/* Filter Dropdown Popover */}
      {isFilterDropdownOpen && (
        <div className="absolute top-13 right-0 bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] rounded-2xl shadow-xl z-50 p-1.5 w-52 max-h-[280px] overflow-y-auto divide-y divide-[var(--parchment-divider)]/50 scrollbar-thin animate-fade-in">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[var(--sepia-muted)] tracking-wider">
            Filter by Type
          </div>
          <button
            type="button"
            onClick={() => { setGlobalTypeFilter('All'); setIsFilterDropdownOpen(false); }}
            className={cn(
              "w-full text-left text-xs px-3.5 py-2 rounded-lg flex items-center transition-colors cursor-pointer",
              globalTypeFilter === 'All'
                ? "text-[var(--brass-accent)] font-semibold bg-[var(--brass-accent)]/10 border-l-2 border-[var(--brass-accent)] pl-3"
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
                  ? "text-[var(--brass-accent)] font-semibold bg-[var(--brass-accent)]/10 border-l-2 border-[var(--brass-accent)] pl-3"
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
                  <p className="text-[10px] uppercase font-bold text-[var(--sepia-muted)] tracking-wider px-2 mb-1.5">Journals</p>
                  {searchResults.journals.map(j => {
                    const hasImg = (j.coverImage && j.coverImage.trim() !== '') || (j.recentImages && j.recentImages.length > 0 && j.recentImages[0] && j.recentImages[0].trim() !== '');
                    const imgSrc = j.coverImage && j.coverImage.trim() !== '' ? j.coverImage : j.recentImages?.[0];
                    return (
                      <button
                        key={j.id}
                        onClick={() => {
                          setActiveJournalId(j.id);
                          setActiveView('journal-landing');
                          setGlobalSearchQuery('');
                          setIsFilterDropdownOpen(false);
                        }}
                        className="w-full text-left text-xs text-[var(--foreground)] hover:bg-black/5 p-3 rounded-lg transition-all flex items-center gap-4.5 cursor-pointer group min-h-[84px]"
                      >
                        {/* Left Column: Image & Rating */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-14 text-center">
                          {hasImg && imgSrc ? (
                            <img
                              src={imgSrc}
                              alt=""
                              className="w-14 h-14 rounded-md object-cover border border-[var(--parchment-border)]"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-md border border-[var(--parchment-border)] flex items-center justify-center bg-[var(--pub-bg-alt)]">
                              <BookOpen size={22} className="text-[var(--brass-accent)]" />
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
                      </button>
                    );
                  })}
                </div>
              )}

              {searchResults.spirits.length > 0 && (
                <div className="py-1">
                  <p className="text-[10px] uppercase font-bold text-[var(--sepia-muted)] tracking-wider px-2 mb-1.5">Spirits</p>
                  {searchResults.spirits.map(s => {
                    const hasImg = s.thumbnailImage && s.thumbnailImage.trim() !== '';
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveJournalId(s.journalId);
                          selectSpirit(s.id);
                          setActiveView('journal-detail');
                          setGlobalSearchQuery('');
                          setIsFilterDropdownOpen(false);
                        }}
                        className="w-full text-left text-xs text-[var(--foreground)] hover:bg-black/5 p-3 rounded-lg transition-all flex items-center gap-4.5 cursor-pointer group min-h-[84px]"
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
                          <p className="text-[11px] text-[var(--brass-accent)] font-medium truncate mt-0.5">
                            In {s.journalName}
                          </p>
                        </div>
                      </button>
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
