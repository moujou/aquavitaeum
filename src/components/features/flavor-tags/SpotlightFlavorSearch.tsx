'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check, Sparkles } from 'lucide-react';
import {
  getAllFlavorDescriptors,
  RADAR_DIMENSION_COLORS,
} from '@/data/spirit-flavor-taxonomy';
import { useLanguage } from '@/context/LanguageContext';
import { translateRadarDimension } from '@/lib/i18n/translations';
import { isTagSelected } from '@/components/features/flavor-tags/FlavorTagSelector';
import { cn } from '@/lib/utils';

interface SpotlightFlavorSearchProps {
  activeTags: string[];
  otherSensoryTags?: string[];
  activeSensoryMode: 'nose' | 'taste';
  onToggleTag: (tagName: string) => void;
  onRequestCustomFlavor: (initialName: string) => void;
  placeholder?: string;
  className?: string;
}

export function SpotlightFlavorSearch({
  activeTags,
  otherSensoryTags = [],
  activeSensoryMode,
  onToggleTag,
  onRequestCustomFlavor,
  placeholder,
  className,
}: SpotlightFlavorSearchProps) {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allDescriptors = getAllFlavorDescriptors();

  // Filter matching descriptors based on query
  const trimmedQuery = query.trim().toLowerCase();
  const matchingDescriptors = trimmedQuery.length === 0
    ? []
    : allDescriptors.filter((desc) => {
        const descId = desc.id.toLowerCase();
        const descEN = desc.name.EN.toLowerCase();
        const descDE = desc.name.DE.toLowerCase();
        const aliases = (desc.aliases || []).map((a) => a.toLowerCase());

        return (
          descId.includes(trimmedQuery) ||
          descEN.includes(trimmedQuery) ||
          descDE.includes(trimmedQuery) ||
          aliases.some((a) => a.includes(trimmedQuery))
        );
      }).slice(0, 8); // Top 8 most relevant suggestions

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || matchingDescriptors.length === 0) {
      if (e.key === 'Enter' && trimmedQuery.length > 0) {
        e.preventDefault();
        onRequestCustomFlavor(query.trim());
        setQuery('');
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % (matchingDescriptors.length + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + matchingDescriptors.length + 1) % (matchingDescriptors.length + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex < matchingDescriptors.length) {
        const selected = matchingDescriptors[highlightedIndex];
        const tagName = selected.name[language] ?? selected.name.EN;
        onToggleTag(tagName);
        setQuery('');
        setIsOpen(false);
      } else {
        // Highlighted on "Create Custom Flavor"
        onRequestCustomFlavor(query.trim());
        setQuery('');
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input Bar */}
      <div className="relative w-full flex items-center">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sepia-light)] pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setHighlightedIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || t('spotlightSearchPlaceholder')}
          className="w-full bg-[var(--parchment-bg-alt)]/70 border border-[var(--parchment-border)] rounded-md pl-9 pr-24 py-2 text-xs sm:text-sm font-body text-[var(--foreground)] placeholder:text-[var(--sepia-muted)]/60 focus:outline-none focus:border-[var(--wood-selection)] focus:ring-1 focus:ring-[var(--wood-selection)]/30 transition-all shadow-inner"
        />

        {/* Inline Quick Action Badge */}
        <div className="absolute right-2 flex items-center gap-1">
          {query.trim().length > 0 ? (
            <button
              type="button"
              onClick={() => {
                onRequestCustomFlavor(query.trim());
                setQuery('');
                setIsOpen(false);
              }}
              className="px-2 py-1 rounded bg-[var(--wood-selection)] text-white text-[11px] font-display font-bold uppercase tracking-wider hover:scale-105 transition-transform flex items-center gap-1 shadow-xs cursor-pointer"
            >
              <Plus size={12} />
              <span>{language === 'DE' ? 'Neu' : 'New'}</span>
            </button>
          ) : (
            <span className="text-[11px] font-display uppercase tracking-wider text-[var(--sepia-muted)]/70 px-2 py-0.5 rounded bg-black/5 select-none hidden sm:inline-block">
              {activeSensoryMode === 'nose' ? t('inNose') : t('inTaste')}
            </span>
          )}
        </div>
      </div>

      {/* Floating Spotlight Autocomplete Dropdown */}
      {isOpen && trimmedQuery.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-lg shadow-xl overflow-hidden divide-y divide-[var(--parchment-divider)] max-h-72 overflow-y-auto animate-fade-in"
        >
          {matchingDescriptors.length > 0 ? (
            matchingDescriptors.map((desc, idx) => {
              const tagName = desc.name[language] ?? desc.name.EN;
              const isSelectedInCurrent = isTagSelected(desc, activeTags);
              const isSelectedInOther = !isSelectedInCurrent && isTagSelected(desc, otherSensoryTags);
              const isHighlighted = highlightedIndex === idx;
              const dotColor = desc.color ?? RADAR_DIMENSION_COLORS[desc.radarDimension] ?? '#C59B27';

              return (
                <button
                  key={desc.id}
                  type="button"
                  onClick={() => {
                    onToggleTag(tagName);
                    setQuery('');
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    'w-full px-3.5 py-2 flex items-center justify-between text-left transition-colors cursor-pointer text-xs sm:text-sm font-body',
                    isHighlighted ? 'bg-[var(--pub-bg-alt)]' : 'hover:bg-black/5'
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className="font-semibold text-[var(--foreground)] truncate">
                      {tagName}
                    </span>
                    <span className="text-[11px] text-[var(--sepia-muted)] font-normal hidden sm:inline-block">
                      ({translateRadarDimension(desc.radarDimension, language)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelectedInCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--wood-selection)] text-white text-[10px] font-bold flex items-center gap-1">
                        <Check size={10} />
                        {activeSensoryMode === 'nose' ? t('inNose') : t('inTaste')}
                      </span>
                    )}
                    {isSelectedInOther && (
                      <span className="px-2 py-0.5 rounded-full bg-black/10 text-[var(--sepia-muted)] text-[10px] font-medium">
                        {activeSensoryMode === 'nose' ? t('inTaste') : t('inNose')}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-3 text-center text-xs text-[var(--sepia-muted)] font-body">
              {t('noAromasFound')}
            </div>
          )}

          {/* 1-Tap Create Custom Flavor Action inside dropdown */}
          <button
            type="button"
            onClick={() => {
              onRequestCustomFlavor(query.trim());
              setQuery('');
              setIsOpen(false);
            }}
            onMouseEnter={() => setHighlightedIndex(matchingDescriptors.length)}
            className={cn(
              'w-full px-3.5 py-2.5 flex items-center justify-between text-left text-xs sm:text-sm font-body font-bold text-[var(--wood-selection)] transition-colors cursor-pointer bg-[var(--pub-bg-alt)]/40',
              highlightedIndex === matchingDescriptors.length ? 'bg-[var(--pub-bg-alt)] ring-1 ring-inset ring-[var(--wood-selection)]/30' : 'hover:bg-black/5'
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-[var(--wood-selection)]" />
              <span>{t('customFlavorSearchShortcut').replace('{query}', query.trim())}</span>
            </div>
            <Plus size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
