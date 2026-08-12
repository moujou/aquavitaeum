/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { MapPin, Star, CheckCircle2 } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { cn } from '@/lib/utils';
import { scoreToStars } from '@/lib/spirit-utils';

interface SpiritCardProps {
  spirit: Spirit;
  isSelected: boolean;
  onClick: () => void;
  /** True when the sidebar is in long-press multi-select mode */
  isSelectMode?: boolean;
  /** True when this card is checked (selected for bulk delete) */
  isSelectChecked?: boolean;
}

export function SpiritCard({ spirit, isSelected, onClick, isSelectMode = false, isSelectChecked = false }: SpiritCardProps) {
  const stars = scoreToStars(spirit.rating100);
  const colourHex = SPIRIT_COLOUR_HEX[spirit.colour as SpiritColour] ?? '#FFD700';

  return (
    <button
      id={`spirit-card-${spirit.id}`}
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex flex-col text-left rounded-xl border transition-all duration-300 ease-out group overflow-hidden cursor-pointer relative shrink-0',
        isSelectMode
          ? isSelectChecked
            ? 'border-[#C59B27] bg-[#C59B27]/10 shadow-[0_0_15px_rgba(197,155,39,0.25)] scale-[1.02]'
            : 'border-[#C4A87A]/20 bg-[#1A120B]/40 scale-[0.97]'
          : [
              'hover:shadow-[0_0_20px_rgba(197,155,39,0.15)] hover:scale-[1.01]',
              isSelected
                ? 'border-[#C59B27] bg-[#C59B27]/10 shadow-[0_0_15px_rgba(197,155,39,0.25)]'
                : 'border-[#C4A87A]/20 bg-[#1A120B]/40 hover:border-[#C59B27]/60 hover:bg-[#1A120B]/50',
            ].join(' '),
      )}
      aria-pressed={isSelected}
    >
      {/* Dynamic Keyframe Animation Stylesheet (Hardware Accelerated) */}
      <style>{`
        @keyframes fluid-flow {
          0% { background-position-y: 0%; }
          100% { background-position-y: 200%; }
        }
        .animate-fluid-flow {
          background-size: 100% 200%;
          animation: fluid-flow 5s linear infinite;
        }
      `}</style>

      {/* Cover Image / Widescreen Thumbnail Container */}
      <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-[#22170F] to-[#0D0805] border-b border-white/5 shrink-0">
        {/* Cover Image or Dynamic Placeholder */}
        {spirit.thumbnailImage ? (
          <img
            src={spirit.thumbnailImage}
            alt={spirit.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at center, ${colourHex}12 0%, #1A120B 80%, #0F0A06 100%)`,
            }}
          >
            {/* Ambient Background Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        )}

        {/* Dark scrim for unselected cards in select mode */}
        {isSelectMode && !isSelectChecked && (
          <div className="absolute inset-0 z-10 bg-black/45 transition-opacity duration-200 pointer-events-none" />
        )}

        {/* Circular checkbox in select mode (top-right of thumbnail) */}
        {isSelectMode && (
          <div className="absolute top-2 right-2 z-20">
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200',
                isSelectChecked
                  ? 'bg-[#C59B27] border-[#C59B27]'
                  : 'bg-black/50 border-white/40',
              )}
            >
              {isSelectChecked && <CheckCircle2 className="w-3.5 h-3.5 text-[#1a0f00]" />}
            </div>
          </div>
        )}

      </div>

      {/* Padded Text Details Section with Right Padding for Column spacing */}
      <div className="w-full pt-3.5 pb-3.5 pl-3.5 pr-[9%] lg:pt-4 lg:pb-4 lg:pl-4 lg:pr-[9%] flex flex-col gap-2 flex-1 min-w-0 relative">
        {/* 6% Width Accent Column (self-contained fluid flow shimmer, no outer glow) */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[6%] overflow-hidden shrink-0"
          style={{ backgroundColor: colourHex }}
        >
          {/* Shimmer liquid flow overlay */}
          <div
            className="absolute inset-0 animate-fluid-flow"
            style={{
              backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 30%, rgba(0,0,0,0.15) 70%, rgba(255,255,255,0.18) 100%)',
              backgroundSize: '100% 200%',
            }}
          />
          {/* Inner Depth Shadow */}
          <div className="absolute inset-0 shadow-[inset_1px_0_4px_rgba(0,0,0,0.35),inset_-1px_0_4px_rgba(255,255,255,0.15)] pointer-events-none" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Distillery Name (Upgraded typography) */}
          <p className="font-display text-[17px] lg:text-[19px] font-black text-white group-hover:text-[#C59B27] transition-colors duration-300 truncate leading-snug">
            {spirit.distillery}
          </p>

          {/* Spirit Bottle / Label Name (Upgraded typography) */}
          <p className="text-[15px] lg:text-[16px] font-body font-bold text-white/80 leading-snug truncate mt-0.5">
            {spirit.name}
          </p>

          {/* Star Rating Bar & Rating Score Row (Aligned to the right edge) */}
          <div className="flex items-center justify-between gap-2 mt-1.5 pr-2">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={15}
                  className={cn(
                    stars >= s
                      ? 'fill-[#C59B27] text-[#C59B27]'
                      : stars >= s - 0.5
                      ? 'fill-[#C59B27]/50 text-[#C59B27]'
                      : 'fill-none text-white/10',
                  )}
                />
              ))}
            </div>
            <span
              className={cn(
                'font-display text-[19px] lg:text-[21px] font-black leading-none select-none tracking-tight',
                spirit.rating100 >= 90
                  ? 'text-amber-400 [text-shadow:0_0_8px_rgba(245,158,11,0.4)]'
                  : spirit.rating100 >= 80
                  ? 'text-emerald-400 [text-shadow:0_0_8px_rgba(52,211,153,0.4)]'
                  : 'text-white/80',
              )}
            >
              {spirit.rating100}
            </span>
          </div>

          {/* Specifications: Region, Age, ABV (Upgraded typography) */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-white/60 font-body text-[14px] font-semibold">
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-white/40 shrink-0" />
              <span className="truncate max-w-[120px]">{spirit.region}</span>
            </span>
            {spirit.age && (
              <span className="bg-white/5 px-1.5 py-0.5 rounded-sm border border-white/5 text-[12px] font-mono leading-none">
                {spirit.age}yr
              </span>
            )}
            <span className="bg-white/5 px-1.5 py-0.5 rounded-sm border border-white/5 text-[12px] font-mono leading-none">
              {spirit.abv}%
            </span>
          </div>
        </div>

        {/* Separator / Footer of the Card: Type only (Upgraded typography) */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2.5 border-t border-white/5">
          <p className="text-[12px] lg:text-[13px] text-white/45 font-body uppercase tracking-wider font-black truncate">
            {spirit.spiritType}
          </p>
        </div>
      </div>
    </button>
  );
}
