'use client';

import { useState, useMemo } from 'react';
import { Search, Plus, MapPin, Percent, Star, Wine } from 'lucide-react';
import { Spirit, SpiritType, SPIRIT_TYPES } from '@/types/spirit.types';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpiritCollectionGridProps {
  spirits: Spirit[];
  selectedId: string | null;
  isLoading?: boolean;
  onSelect: (spirit: Spirit) => void;
  onNewNote: () => void;
  className?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLOUR_HEX: Record<string, string> = {
  'Dark Oak': '#3B1A05',
  Mahogany: '#6B2D0F',
  Copper: '#B87333',
  Amber: '#FFBF00',
  Gold: '#FFD700',
  Honey: '#FFC04D',
  Straw: '#E8D8A0',
  'White Wine': '#F5F0DC',
  Clear: '#D0E8FF',
};

const TYPE_FILTERS: (SpiritType | 'All')[] = ['All', ...SPIRIT_TYPES];

// ─── Skeleton Card Component ──────────────────────────────────────────────────

function SpiritCardSkeleton() {
  return (
    <div className="w-full flex-shrink-0 rounded-xl border border-white/5 bg-white/[0.03] p-4 animate-pulse overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          <div className="w-12 h-16 rounded-sm bg-white/10 flex-shrink-0" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 bg-white/10 rounded w-3/4" />
            <div className="h-3 bg-white/5 rounded w-1/2" />
            <div className="h-2.5 bg-white/5 rounded w-2/3" />
          </div>
        </div>
        <div className="w-12 h-10 rounded bg-white/10 flex-shrink-0" />
      </div>
    </div>
  );
}

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
        'w-full flex-shrink-0 text-left rounded-xl border transition-all duration-200 p-4 group overflow-hidden',
        'hover:shadow-lg hover:scale-[1.005]',
        isSelected
          ? 'border-[#C59B27] bg-[#C59B27]/10 shadow-[0_0_15px_rgba(197,155,39,0.2)]'
          : 'border-white/10 bg-white/5 hover:border-[#C59B27]/50 hover:bg-white/8',
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between gap-4 min-w-0">
        {/* Left: Swatch + Details */}
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {/* Swatch or Custom Photo Thumbnail + Vertical Color Accent Bar */}
          {spirit.thumbnailImage ? (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              {/* Photo Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spirit.thumbnailImage}
                alt={spirit.name}
                className="w-12 h-16 rounded-sm border border-white/20 object-cover shadow-md"
              />
              {/* Vertical Spirit Color Accent Bar */}
              <div
                className="w-2 h-16 rounded-xs border border-white/10 shadow-inner"
                title={`Colour: ${spirit.colour}`}
                style={{ backgroundColor: colourHex }}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 mt-0.5">
              <div
                className="w-12 h-16 rounded-sm border border-white/20 shadow-inner"
                style={{ backgroundColor: colourHex }}
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-display text-base font-bold text-[#C59B27] truncate leading-snug">
              {spirit.distillery}
            </p>
            <p className="text-sm font-body text-[#e8d5b7] leading-tight truncate mt-0.5">
              {spirit.name}
            </p>

            <div className="flex items-center gap-3 mt-1.5 flex-wrap text-white/60 font-body text-xs">
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-white/40" />
                <span className="truncate max-w-[110px]">{spirit.region}</span>
              </span>
              {spirit.age && <span>{spirit.age}yr</span>}
              <span className="flex items-center gap-1.5">
                <Percent size={13} className="text-white/40" />
                {spirit.abv}
              </span>
            </div>

            <div className="flex items-center gap-1 mt-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={15}
                  className={cn(
                    stars >= s
                      ? 'fill-[#C59B27] text-[#C59B27]'
                      : stars >= s - 0.5
                      ? 'fill-[#C59B27]/50 text-[#C59B27]'
                      : 'fill-none text-white/20',
                  )}
                />
              ))}
            </div>

            <p className="text-xs text-[#a07d1a] font-body mt-1 font-semibold truncate">
              {spirit.spiritType}
            </p>
          </div>
        </div>

        {/* Right-Center Aligned Sleek Borderless Score Display */}
        <div className="flex-shrink-0 self-center text-right ml-2 pr-1">
          <span
            className={cn(
              'font-display text-2xl font-black leading-none tracking-tight transition-all duration-200',
              spirit.rating100 >= 90
                ? 'text-amber-300 [text-shadow:0_0_12px_rgba(245,158,11,0.35)]'
                : spirit.rating100 >= 80
                ? 'text-emerald-300 [text-shadow:0_0_12px_rgba(52,211,153,0.35)]'
                : 'text-white/70 [text-shadow:0_0_8px_rgba(255,255,255,0.1)]',
            )}
          >
            {spirit.rating100}
          </span>
        </div>
      </div>
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SpiritCollectionGrid({
  spirits,
  selectedId,
  isLoading = false,
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
    <div className={cn('h-full flex flex-col gap-3.5 overflow-hidden', className)}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2">
          <Wine size={16} className="text-[#C59B27]" />
          <h2 className="font-display text-base font-bold text-[#C59B27]">
            Collection
          </h2>
          <span className="text-xs text-white/40 font-body">({spirits.length})</span>
        </div>
        <button
          id="new-tasting-note-btn"
          type="button"
          disabled={isLoading}
          onClick={onNewNote}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-display uppercase tracking-wider font-semibold border',
            'bg-[#1A120B] text-[#C59B27] border-[#C59B27] hover:bg-[#C59B27] hover:text-[#1A120B] transition-colors duration-150 cursor-pointer shadow-xs',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        >
          <Plus size={13} />
          New Note
        </button>
      </div>

      {/* Search & Themed Type Filter Dropdown */}
      <div className="flex-shrink-0 flex gap-2.5 items-center">
        <div className="relative flex-1 min-w-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            id="collection-search"
            type="text"
            value={search}
            disabled={isLoading}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search spirits…"
            className={cn(
              'w-full pl-8 pr-3 py-2 rounded-md bg-white/5 border border-white/10',
              'text-xs text-white/90 font-body placeholder:text-white/30',
              'focus:outline-none focus:border-[#C59B27]/60 transition-colors',
              'disabled:opacity-50',
            )}
          />
        </div>
        <select
          id="collection-type-filter"
          value={typeFilter}
          disabled={isLoading}
          onChange={(e) => setTypeFilter(e.target.value as SpiritType | 'All')}
          className={cn(
            'bg-[#1A120B] border border-white/15 text-xs text-[#C59B27] font-body rounded-md px-2.5 py-2',
            'focus:outline-none focus:border-[#C59B27] cursor-pointer transition-colors max-w-[130px] flex-shrink-0',
            'disabled:opacity-50',
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

      {/* Dynamic Scrollable Spirit Cards */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 flex flex-col gap-2.5">
        {isLoading ? (
          <>
            <SpiritCardSkeleton />
            <SpiritCardSkeleton />
            <SpiritCardSkeleton />
            <SpiritCardSkeleton />
          </>
        ) : filtered.length === 0 ? (
          <p className="text-center text-xs text-white/30 font-body py-10 italic">
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
