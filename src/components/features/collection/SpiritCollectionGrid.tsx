'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, MapPin, Percent, Star, Wine } from 'lucide-react';
import { Spirit, SpiritType } from '@/types/spirit.types';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiritCollectionGridProps {
  spirits: Spirit[];
  selectedId: string | null;
  onSelect: (spirit: Spirit) => void;
  onNewNote: () => void;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOUR_HEX: Record<string, string> = {
  'Dark Oak':   '#3B1A05',
  'Mahogany':   '#6B2D0F',
  'Copper':     '#B87333',
  'Amber':      '#FFBF00',
  'Gold':       '#FFD700',
  'Honey':      '#FFC04D',
  'Straw':      '#E8D8A0',
  'White Wine': '#F5F0DC',
  'Clear':      '#D0E8FF',
};

const TYPE_FILTERS: (SpiritType | 'All')[] = [
  'All', 'Single Malt Scotch', 'Blended Scotch', 'Bourbon',
  'Irish Whiskey', 'Japanese Whisky', 'Rye Whiskey', 'Rum', 'Gin',
  'Tequila', 'Mezcal', 'Cognac', 'Armagnac', 'Other',
];

// ─── Spirit Card ──────────────────────────────────────────────────────────────

function SpiritCard({
  spirit,
  isSelected,
  onClick,
}: {
  spirit: Spirit;
  isSelected: boolean;
  onClick: () => void;
}) {
  const stars = Math.round((spirit.rating100 / 100) * 5 * 2) / 2;
  const colourHex = COLOUR_HEX[spirit.colour] ?? '#FFD700';

  return (
    <button
      id={`spirit-card-${spirit.id}`}
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border transition-all duration-200 p-3 group',
        'hover:shadow-lg hover:scale-[1.01]',
        isSelected
          ? 'border-[#C59B27] bg-[#C59B27]/10 shadow-[0_0_0_1px_#C59B27]'
          : 'border-white/10 bg-white/5 hover:border-[#C59B27]/50 hover:bg-white/8',
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-start gap-3">
        {/* Colour swatch */}
        <div className="flex-shrink-0 mt-0.5">
          <div
            className="w-8 h-10 rounded-sm border border-white/20 shadow-inner"
            style={{ backgroundColor: colourHex }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <div className="min-w-0">
              <p className="font-display text-xs font-semibold text-[#C59B27] truncate">
                {spirit.distillery}
              </p>
              <p className="text-[11px] font-body text-[#e8d5b7] leading-tight truncate">
                {spirit.name}
              </p>
            </div>
            <span className={cn(
              'flex-shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-semibold font-body',
              spirit.rating100 >= 90 ? 'bg-amber-500/20 text-amber-300' :
              spirit.rating100 >= 80 ? 'bg-green-500/20 text-green-300' :
              'bg-white/10 text-white/60',
            )}>
              {spirit.rating100}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-[9px] text-white/50 font-body">
              <MapPin size={8} />
              {spirit.region}
            </span>
            {spirit.age && (
              <span className="text-[9px] text-white/50 font-body">{spirit.age}yr</span>
            )}
            <span className="flex items-center gap-1 text-[9px] text-white/50 font-body">
              <Percent size={8} />
              {spirit.abv}
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={10}
                className={cn(
                  stars >= s ? 'fill-[#C59B27] text-[#C59B27]' :
                  stars >= s - 0.5 ? 'fill-[#C59B27]/50 text-[#C59B27]' :
                  'fill-none text-white/20',
                )}
              />
            ))}
          </div>

          <p className="text-[9px] text-[#a07d1a] font-body mt-0.5 font-medium">{spirit.spiritType}</p>
        </div>
      </div>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpiritCollectionGrid({
  spirits,
  selectedId,
  onSelect,
  onNewNote,
  className,
}: SpiritCollectionGridProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpiritType | 'All'>('All');

  const filtered = useMemo(() => {
    return spirits.filter((s) => {
      const matchesType = typeFilter === 'All' || s.spiritType === typeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.distillery.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.spiritType.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [spirits, search, typeFilter]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wine size={14} className="text-[#C59B27]" />
          <h2 className="font-display text-sm font-semibold text-[#C59B27]">
            Collection
          </h2>
          <span className="text-[10px] text-white/40 font-body">({spirits.length})</span>
        </div>
        <button
          id="new-tasting-note-btn"
          type="button"
          onClick={onNewNote}
          className={cn(
            'flex items-center gap-1 px-3 py-1 rounded-sm text-[11px] font-display uppercase tracking-wider font-semibold border',
            'bg-[#1A120B] text-[#C59B27] border-[#C59B27] hover:bg-[#C59B27] hover:text-[#1A120B] transition-colors duration-150 cursor-pointer shadow-xs',
          )}
        >
          <Plus size={11} />
          New Note
        </button>
      </div>

      {/* Search & Themed Type Filter Dropdown */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            id="collection-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spirits…"
            className={cn(
              'w-full pl-7 pr-2 py-1.5 rounded-md bg-white/5 border border-white/10',
              'text-xs text-white/80 font-body placeholder:text-white/30',
              'focus:outline-none focus:border-[#C59B27]/50 transition-colors',
            )}
          />
        </div>
        <select
          id="collection-type-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as SpiritType | 'All')}
          className={cn(
            'bg-[#1A120B] border border-white/15 text-[11px] text-[#C59B27] font-body rounded-md px-2 py-1.5',
            'focus:outline-none focus:border-[#C59B27] cursor-pointer transition-colors max-w-[110px]',
          )}
          aria-label="Filter spirits by type"
        >
          <option value="All">All Types</option>
          {TYPE_FILTERS.filter((t) => t !== 'All').map((type) => (
            <option key={type} value={type} className="bg-[#1A120B] text-white">
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-220px)]">
        {filtered.length === 0 ? (
          <p className="text-center text-xs text-white/30 font-body py-8 italic">
            No spirits match your filter.
          </p>
        ) : (
          filtered.map((spirit) => (
            <SpiritCard
              key={spirit.id}
              spirit={spirit}
              isSelected={spirit.id === selectedId}
              onClick={() => onSelect(spirit)}
            />
          ))
        )}
      </div>
    </div>
  );
}
