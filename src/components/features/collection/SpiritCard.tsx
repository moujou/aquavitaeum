'use client';

import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { Spirit, SPIRIT_COLOUR_HEX, SpiritColour } from '@/types/spirit.types';
import { cn } from '@/lib/utils';
import { scoreToStars } from '@/lib/spirit-utils';

interface SpiritCardProps {
  spirit: Spirit;
  isSelected: boolean;
  onClick: () => void;
}

export function SpiritCard({ spirit, isSelected, onClick }: SpiritCardProps) {
  const stars = scoreToStars(spirit.rating100);
  const colourHex = SPIRIT_COLOUR_HEX[spirit.colour as SpiritColour] ?? '#FFD700';

  const scoreGlowClass =
    spirit.rating100 >= 90
      ? 'text-amber-300 [text-shadow:0_0_12px_rgba(245,158,11,0.35)]'
      : spirit.rating100 >= 80
      ? 'text-emerald-300 [text-shadow:0_0_12px_rgba(52,211,153,0.35)]'
      : 'text-white/70 [text-shadow:0_0_8px_rgba(255,255,255,0.1)]';

  return (
    <button
      id={`spirit-card-${spirit.id}`}
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex-shrink-0 text-left rounded-xl border transition-all duration-300 ease-out p-3 lg:p-4 group overflow-hidden cursor-pointer',
        'hover:shadow-lg hover:scale-[1.005]',
        isSelected
          ? 'border-[#C59B27] bg-[#C59B27]/15 shadow-[0_0_15px_rgba(197,155,39,0.25)]'
          : 'border-[#C4A87A]/20 bg-[#1A120B]/40 hover:border-[#C59B27]/60 hover:bg-[#1A120B]/60',
      )}
      aria-pressed={isSelected}
    >
      <div className="flex items-center justify-between gap-3 lg:gap-4 min-w-0">
        {/* Left: Swatch + Details */}
        <div className="flex items-start gap-3 lg:gap-4 min-w-0 flex-1">
          {/* Swatch or Custom Photo Thumbnail + Vertical Color Accent Bar */}
          {spirit.thumbnailImage ? (
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              {/* Photo Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spirit.thumbnailImage}
                alt={spirit.name}
                className="w-10 h-14 lg:w-12 lg:h-16 rounded-sm border border-white/20 object-cover shadow-md"
              />
              {/* Vertical Spirit Color Accent Bar */}
              <div
                className="w-1.5 h-14 lg:w-2 lg:h-16 rounded-xs border border-white/10 shadow-inner"
                title={`Colour: ${spirit.colour}`}
                style={{ backgroundColor: colourHex }}
              />
            </div>
          ) : (
            <div className="flex-shrink-0 mt-0.5">
              <div
                className="w-10 h-14 lg:w-12 lg:h-16 rounded-sm border border-white/20 shadow-inner"
                style={{ backgroundColor: colourHex }}
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-sm lg:text-base font-bold text-white group-hover:text-[#C59B27]/90 transition-colors truncate leading-snug">
                {spirit.distillery}
              </p>
              {/* Mobile Only Inline Pure Glowing Score (< lg screens) */}
              <span
                className={cn(
                  'lg:hidden font-display text-base font-black leading-none tracking-tight shrink-0',
                  scoreGlowClass,
                )}
              >
                {spirit.rating100}
              </span>
            </div>

            <p className="text-[13px] lg:text-[14px] font-body text-white/80 leading-tight truncate mt-0.5">
              {spirit.name}
            </p>

            <div className="flex items-center gap-2.5 sm:gap-3 mt-1 lg:mt-1.5 flex-wrap text-white/60 font-body text-[12px] lg:text-[13px]">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <MapPin size={13} className="text-white/40" />
                <span className="truncate max-w-[100px] lg:max-w-[110px]">{spirit.region}</span>
              </span>
              {spirit.age && <span>{spirit.age}yr</span>}
              <span>{spirit.abv}%</span>
            </div>

            <div className="flex items-center gap-1 mt-1 lg:mt-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
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

            <p className="text-[11px] lg:text-[12px] text-white/45 font-body mt-1 font-semibold truncate">
              {spirit.spiritType}
            </p>
          </div>
        </div>

        {/* Desktop Only Right Column Pure Glowing Score (≥ lg screens) */}
        <div className="hidden lg:flex flex-shrink-0 self-center text-right ml-2 pr-1">
          <span
            className={cn(
              'font-display text-2xl font-black leading-none tracking-tight transition-all duration-200',
              scoreGlowClass,
            )}
          >
            {spirit.rating100}
          </span>
        </div>
      </div>
    </button>
  );
}
