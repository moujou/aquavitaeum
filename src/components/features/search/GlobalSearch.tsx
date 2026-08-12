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
  setActiveView: (view: 'welcome' | 'overview' | 'journal-detail' | 'profile') => void;
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
    <div ref={searchRef} className="relative flex-1 max-w-sm sm:max-w-md mx-2 sm:mx-4 z-40">
      {/* Search Input Bar */}
      <div className="relative flex items-center bg-black/35 hover:bg-black/45 focus-within:bg-black/50 border border-white/10 focus-within:border-[#C59B27]/50 rounded-md px-3 py-1.5 focus-within:ring-0 focus-within:outline-none h-10 transition-colors duration-150">
        <Search size={16} className="text-white/60 mr-2.5 flex-shrink-0" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          placeholder="Search spirits & journals..."
          className="bg-transparent border-none text-sm text-[#e8d5b7] placeholder-white/40 focus:outline-none focus:ring-0 focus-within:ring-0 w-full pr-10"
        />

        {/* Filter Popover Trigger */}
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center">
          <button
            type="button"
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={cn(
              "h-7 w-7 rounded flex items-center justify-center border border-transparent transition-all cursor-pointer",
              isFilterDropdownOpen
                ? "bg-[#C59B27]/20 border-[#C59B27]/40 text-[#C59B27]"
                : globalTypeFilter !== 'All'
                  ? "bg-[#C59B27]/10 border-[#C59B27]/20 text-[#C59B27] hover:bg-[#C59B27]/20"
                  : "text-white/60 hover:text-white/90 hover:bg-white/5"
            )}
            title="Filter by Spirit Type"
          >
            <SlidersHorizontal size={14} />
          </button>

          {/* Active filter badge dot */}
          {globalTypeFilter !== 'All' && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#C59B27] ring-1 ring-black" />
          )}
        </div>
      </div>

      {/* Filter Dropdown Popover */}
      {isFilterDropdownOpen && (
        <div className="absolute top-11 right-0 bg-[#122616] border border-[#C59B27]/40 rounded-lg shadow-2xl z-50 py-1.5 w-48 max-h-[260px] overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#C59B27]/80 tracking-wider">
            Filter by Type
          </div>
          <button
            type="button"
            onClick={() => { setGlobalTypeFilter('All'); setIsFilterDropdownOpen(false); }}
            className={cn(
              "w-full text-left text-xs px-3.5 py-2 flex items-center transition-colors cursor-pointer",
              globalTypeFilter === 'All'
                ? "text-[#C59B27] font-semibold bg-white/5 border-l-2 border-[#C59B27] pl-3"
                : "text-[#e8d5b7]/80 hover:text-white hover:bg-white/5"
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
                "w-full text-left text-xs px-3.5 py-2 flex items-center transition-colors cursor-pointer",
                globalTypeFilter === type
                  ? "text-[#C59B27] font-semibold bg-[#C59B27]/10 border-l-2 border-[#C59B27] pl-3"
                  : "text-[#e8d5b7]/80 hover:text-white hover:bg-white/5"
              )}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {/* Search Results Dropdown */}
      {globalSearchQuery.trim() !== '' && (
        <div className="absolute top-10 left-0 right-0 bg-[#224229] border border-[#C59B27]/40 rounded-lg shadow-2xl z-50 p-2 max-h-[380px] overflow-y-auto divide-y divide-white/5">
          {searchResults.journals.length === 0 && searchResults.spirits.length === 0 ? (
            <p className="text-center text-xs text-white/40 py-4 italic">
              No matches found.
            </p>
          ) : (
            <>
              {searchResults.journals.length > 0 && (
                <div className="py-1">
                  <p className="text-[10px] uppercase font-bold text-[#C59B27] tracking-wider px-2 mb-1.5">Journals</p>
                  {searchResults.journals.map(j => {
                    const hasImg = (j.coverImage && j.coverImage.trim() !== '') || (j.recentImages && j.recentImages.length > 0 && j.recentImages[0] && j.recentImages[0].trim() !== '');
                    const imgSrc = j.coverImage && j.coverImage.trim() !== '' ? j.coverImage : j.recentImages?.[0];
                    return (
                      <button
                        key={j.id}
                        onClick={() => {
                          setActiveJournalId(j.id);
                          setActiveView('journal-detail');
                          setGlobalSearchQuery('');
                        }}
                        className="w-full text-left text-xs text-[#E8D5B7] hover:bg-white/5 p-3 rounded-lg transition-all flex items-center gap-4.5 cursor-pointer group min-h-[84px]"
                      >
                        {/* Left Column: Image & Rating */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-14 text-center">
                          {hasImg && imgSrc ? (
                            <img
                              src={imgSrc}
                              alt=""
                              className="w-14 h-14 rounded-md object-cover border border-white/10"
                            />
                          ) : (
                            <div
                              className="w-14 h-14 rounded-md border border-white/5 flex items-center justify-center"
                              style={{ background: 'radial-gradient(circle, #2A5E3F33 0%, #121212 100%)' }}
                            >
                              <BookOpen size={22} className="text-[#2A5E3F] opacity-70" />
                            </div>
                          )}
                          {j.averageRating > 0 && (
                            <div className="flex items-center gap-0.5 text-[#C59B27] font-black text-[12px] sm:text-[13px] mt-1.5 select-none leading-none">
                              <Star size={12} className="fill-[#C59B27] text-[#C59B27] shrink-0" />
                              <span>{j.averageRating}</span>
                            </div>
                          )}
                        </div>

                        {/* Right Column: Text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                          <p className="font-display font-black text-[14px] sm:text-[15px] text-white group-hover:text-[#C59B27] transition-colors truncate">
                            {j.name}
                          </p>
                          <p className="font-body text-[12px] text-white/60 line-clamp-1 italic mt-0.5">
                            {j.description || 'No description provided.'}
                          </p>
                          <p className="text-[11px] text-white/40 truncate mt-0.5">
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
                  <p className="text-[10px] uppercase font-bold text-[#C59B27] tracking-wider px-2 mb-1.5">Spirits</p>
                  {searchResults.spirits.map(s => {
                    const hasImg = s.thumbnailImage && s.thumbnailImage.trim() !== '';
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActiveJournalId(s.journalId);
                          setActiveView('journal-detail');
                          selectSpirit(s.id);
                          setGlobalSearchQuery('');
                        }}
                        className="w-full text-left text-xs text-[#E8D5B7] hover:bg-white/5 p-3 rounded-lg transition-all flex items-center gap-4.5 cursor-pointer group min-h-[84px]"
                      >
                        {/* Left Column: Image & Rating */}
                        <div className="flex flex-col items-center justify-center shrink-0 w-14 text-center">
                          {hasImg && s.thumbnailImage ? (
                            <img
                              src={s.thumbnailImage}
                              alt=""
                              className="w-14 h-14 rounded-md object-cover border border-white/10"
                            />
                          ) : (
                            <div
                              className="w-14 h-14 rounded-md border border-white/5 flex items-center justify-center"
                              style={{ background: 'radial-gradient(circle, #C59B2722 0%, #121212 100%)' }}
                            >
                              <WhiskyLogo size={22} className="text-[#C59B27] opacity-60" />
                            </div>
                          )}
                          <div className="flex items-center gap-0.5 text-[#C59B27] font-black text-[12px] sm:text-[13px] mt-1.5 select-none leading-none">
                            <Star size={12} className="fill-[#C59B27] text-[#C59B27] shrink-0" />
                            <span>{s.rating100}</span>
                          </div>
                        </div>

                        {/* Right Column: Text */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                          <p className="font-display font-black text-[14px] sm:text-[15px] text-white group-hover:text-[#C59B27] transition-colors truncate">
                            {s.name}
                          </p>
                          <p className="font-body text-[12px] text-white/60 line-clamp-1 italic mt-0.5">
                            {s.distillery} • {s.region} ({s.spiritType})
                          </p>
                          <p className="text-[11px] text-[#C59B27] font-medium truncate mt-0.5">
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
