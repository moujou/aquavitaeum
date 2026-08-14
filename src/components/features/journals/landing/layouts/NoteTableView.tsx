/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { Check, Star, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { translateColour } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

interface NoteTableViewProps {
  spirits: Spirit[];
  onSelect: (id: string) => void;
  isSelectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onTouchStart: (e: React.TouchEvent, id: string) => void;
  cancelLongPress: () => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function NoteTableView({
  spirits,
  onSelect,
  isSelectMode,
  selectedIds,
  onToggleSelect,
  onTouchStart,
  cancelLongPress,
  onTouchEnd
}: NoteTableViewProps) {
  const { language } = useLanguage();

  return (
    <div className="px-2 sm:px-4 py-4 w-full">
      <div className="overflow-x-auto w-full rounded-xl border border-white/8 bg-[#0D140F]/60 backdrop-blur-md shadow-xl">
        <table className="w-full text-left border-collapse min-w-[900px]">
          {/* Frosted Luxury Header */}
          <thead className="sticky top-0 z-10 backdrop-blur-xl bg-[#0B120E]/95 border-b border-[var(--brass-accent)]/25 shadow-md">
            <tr>
              {isSelectMode && <th className="px-3 py-3.5 w-10"></th>}
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brass-muted)] font-display">Spirit</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brass-muted)] font-display">Type</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brass-muted)] font-display">Colour</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brass-muted)] font-display">Region</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brass-muted)] font-display">ABV</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brass-muted)] font-display text-center">Score</th>
              <th className="px-4 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[var(--brass-muted)] font-display text-right">Date Tasted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {spirits.map((spirit) => {
              const formattedDate = spirit.dateTasted
                ? new Date(spirit.dateTasted).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                : '—';
              
              const isSelected = selectedIds.has(spirit.id);
              const colourHex = SPIRIT_COLOUR_HEX[spirit.colour as SpiritColour] ?? '#FFD700';
              const colourName = spirit.colour ? translateColour(spirit.colour, language) : '—';

              return (
                <tr
                  key={spirit.id}
                  onClick={() => isSelectMode ? onToggleSelect(spirit.id) : onSelect(spirit.id)}
                  onTouchStart={(e) => onTouchStart(e, spirit.id)}
                  onTouchEnd={onTouchEnd}
                  onTouchCancel={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  className={cn(
                    "group cursor-pointer transition-all duration-200 border-l-2 relative",
                    isSelectMode
                      ? isSelected
                        ? "bg-[var(--brass-accent)]/15 border-l-[var(--brass-accent)]"
                        : "opacity-45 hover:opacity-75 hover:bg-white/[0.02] border-l-transparent"
                      : "border-l-transparent hover:border-l-[var(--brass-accent)] hover:bg-white/[0.035]"
                  )}
                >
                  {/* Select Mode Checkbox */}
                  {isSelectMode && (
                    <td className="px-3 py-3.5 w-10">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "border-[var(--brass-accent)] bg-[var(--brass-accent)]" : "border-white/30 bg-transparent"
                      )}>
                        {isSelected && <Check size={11} strokeWidth={3} className="text-[var(--wood-dark)]" />}
                      </div>
                    </td>
                  )}

                  {/* Spirit Column (Thumbnail + Distillery + Name) */}
                  <td className="px-4 py-3.5 min-w-[240px]">
                    <div className="flex items-center gap-3">
                      {/* Micro Bottle Thumbnail with Natural Spirit Glow */}
                      <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden bg-gradient-to-br from-[#1C130D] to-[#0A0704] border border-white/10 relative flex items-center justify-center shadow-xs group-hover:border-[var(--brass-accent)]/40 transition-colors">
                        {spirit.thumbnailImage ? (
                          <img src={spirit.thumbnailImage} alt={spirit.name} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full"
                            style={{
                              background: `radial-gradient(circle at center, ${colourHex}60 0%, #16110B 75%, #0A0704 100%)`,
                            }}
                          />
                        )}
                        {/* Ambient Liquid Hue Pip */}
                        <div
                          className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-black/40 shadow-xs"
                          style={{ backgroundColor: colourHex }}
                          title={`Spirit color: ${colourName}`}
                        />
                      </div>

                      {/* Editorial Typography: Distillery + Label Name */}
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-bold text-sm text-[var(--foreground)] group-hover:text-[var(--brass-accent)] transition-colors truncate">
                          {spirit.distillery}
                        </div>
                        <div className="font-body text-xs text-white/60 truncate mt-0.5 font-medium">
                          {spirit.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Spirit Type Pill */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center text-[11px] font-semibold tracking-wide bg-white/[0.04] border border-white/10 px-2.5 py-0.5 rounded-full text-white/80">
                      {spirit.spiritType}
                    </span>
                  </td>

                  {/* Dedicated Colour Column */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-xs shrink-0"
                        style={{ backgroundColor: colourHex }}
                      />
                      <span className="text-xs text-white/70 font-medium font-body">
                        {colourName}
                      </span>
                    </div>
                  </td>

                  {/* Region with Micro Pin */}
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-white/55 font-body">
                      <MapPin size={12} className="text-[var(--brass-accent)]/60 shrink-0" />
                      <span className="truncate">{spirit.region || '—'}</span>
                    </div>
                  </td>

                  {/* ABV % */}
                  <td className="px-4 py-3.5 font-mono text-xs text-white/65 whitespace-nowrap">
                    {spirit.abv ? `${spirit.abv}%` : '—'}
                  </td>

                  {/* Rating Badge Medal */}
                  <td className="px-4 py-3.5 whitespace-nowrap text-center">
                    <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md bg-[var(--brass-accent)]/10 border border-[var(--brass-accent)]/30 text-[var(--brass-accent)] font-display font-black text-sm shadow-xs min-w-[54px]">
                      <Star size={12} className="fill-[var(--brass-accent)] -mt-0.5" />
                      <span>{spirit.rating100}</span>
                    </div>
                  </td>

                  {/* Date Tasted */}
                  <td className="px-4 py-3.5 font-mono text-xs text-white/40 whitespace-nowrap text-right">
                    {formattedDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
