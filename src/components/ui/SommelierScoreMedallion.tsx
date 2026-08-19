'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ScoreTierConfig {
  min: number;
  max: number;
  labelEn: string;
  labelDe: string;
  badgeEn: string;
  badgeDe: string;
  emoji: string;
  gradient: string;
  border: string;
  glow: string;
  colorHex: string;
  pillBg: string;
  pillBorder: string;
}

export const SCORE_TIERS_CONFIG: ScoreTierConfig[] = [
  // 1. 90-100: Masterpiece / Meisterwerk (Grand Cru / Gold Medal)
  {
    min: 90,
    max: 100,
    labelEn: 'Masterpiece / Exceptional',
    labelDe: 'Meisterwerk / Außergewöhnlich',
    badgeEn: 'MASTERPIECE',
    badgeDe: 'MEISTERWERK',
    emoji: '★',
    gradient: 'from-[#D97706] via-[#B45309] to-[#78350F]',
    border: 'border-[#FCD34D]',
    glow: 'shadow-[0_0_20px_rgba(217,119,6,0.45)]',
    colorHex: '#D97706',
    pillBg: 'bg-amber-500/15',
    pillBorder: 'border-amber-600/40',
  },
  // 2. 85-89: Excellent / Ausgezeichnet (Highly Recommended / Silver Medal)
  {
    min: 85,
    max: 89,
    labelEn: 'Excellent / Distinguished',
    labelDe: 'Ausgezeichnet / Hervorragend',
    badgeEn: 'EXCELLENT',
    badgeDe: 'AUSGEZEICHNET',
    emoji: '★',
    gradient: 'from-[#C2410C] via-[#9A3412] to-[#7C2D12]',
    border: 'border-[#FB923C]',
    glow: 'shadow-[0_0_16px_rgba(194,65,12,0.35)]',
    colorHex: '#C2410C',
    pillBg: 'bg-orange-500/15',
    pillBorder: 'border-orange-600/40',
  },
  // 3. 80-84: Very Good / Sehr gut (Recommended / Solid Quality)
  {
    min: 80,
    max: 84,
    labelEn: 'Very Good / Recommended',
    labelDe: 'Sehr gut / Empfohlen',
    badgeEn: 'VERY GOOD',
    badgeDe: 'SEHR GUT',
    emoji: '★',
    gradient: 'from-[#2E945D] via-[#237347] to-[#1B5733]',
    border: 'border-[#6EE7B7]',
    glow: 'shadow-[0_0_16px_rgba(46,148,93,0.35)]',
    colorHex: '#2E945D',
    pillBg: 'bg-emerald-500/15',
    pillBorder: 'border-emerald-600/40',
  },
  // 4. 70-79: Good / Solide (Daily Sipper / Standard Dram)
  {
    min: 70,
    max: 79,
    labelEn: 'Good / Solid Sipper',
    labelDe: 'Gut / Solider Dram',
    badgeEn: 'GOOD',
    badgeDe: 'GUT',
    emoji: '★',
    gradient: 'from-[#78716C] via-[#57534E] to-[#44403C]',
    border: 'border-[#D6D3D1]',
    glow: 'shadow-[0_0_12px_rgba(120,113,108,0.25)]',
    colorHex: '#78716C',
    pillBg: 'bg-stone-500/15',
    pillBorder: 'border-stone-600/40',
  },
  // 5. 1-69: Developing / Einfach (Casual / Young / Base)
  {
    min: 1,
    max: 69,
    labelEn: 'Developing / Casual',
    labelDe: 'In Entwicklung / Einfach',
    badgeEn: 'CASUAL',
    badgeDe: 'EINFACH',
    emoji: '★',
    gradient: 'from-[#44403C] via-[#292524] to-[#1C1917]',
    border: 'border-[#A8A29E]',
    glow: 'shadow-xs',
    colorHex: '#44403C',
    pillBg: 'bg-stone-600/15',
    pillBorder: 'border-stone-700/40',
  },
];

export function getScoreTierConfig(score: number): ScoreTierConfig {
  const safe = Math.max(1, Math.min(100, Math.round(Number(score) || 1)));
  return (
    SCORE_TIERS_CONFIG.find((tier) => safe >= tier.min && safe <= tier.max) ||
    SCORE_TIERS_CONFIG[SCORE_TIERS_CONFIG.length - 1]
  );
}

interface SommelierScoreMedallionProps {
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SommelierScoreMedallion({
  score = 85,
  size = 'md',
  className,
}: SommelierScoreMedallionProps) {
  const { language } = useLanguage();
  const safeScore = typeof score === 'number' && !isNaN(score) && score > 0 ? Math.max(1, Math.min(100, Math.round(score))) : 85;
  const tier = getScoreTierConfig(safeScore);
  const a11yLabel = `${safeScore} / 100 - ${language === 'DE' ? tier.labelDe : tier.labelEn}`;

  // 1. Grid Overview Card Badge: Clean, Circular Embossed Seal (size="sm")
  if (size === 'sm') {
    return (
      <div
        role="img"
        aria-label={a11yLabel}
        title={a11yLabel}
        className={cn(
          'relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br border-2 shadow-md flex items-center justify-center font-display font-black text-sm sm:text-base text-white select-none transition-transform duration-200 group-hover:scale-105 z-10 shrink-0',
          tier.gradient,
          tier.border,
          tier.glow,
          className
        )}
      >
        <div className="absolute inset-0.5 rounded-full border border-white/30 border-dashed pointer-events-none" />
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] relative z-10 leading-none">{safeScore}</span>
      </div>
    );
  }

  // 2. List Overview Row Badge: Clean, Circular Embossed Seal (size="md")
  if (size === 'md') {
    return (
      <div
        role="img"
        aria-label={a11yLabel}
        title={a11yLabel}
        className={cn(
          'relative w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br border-2 shadow-md flex flex-col items-center justify-center text-white select-none shrink-0 transition-transform duration-200 hover:scale-105',
          tier.gradient,
          tier.border,
          tier.glow,
          className
        )}
      >
        <div className="absolute inset-0.5 rounded-full border border-white/30 border-dashed pointer-events-none" />
        <span className="font-display font-black text-base sm:text-lg leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)] z-10">
          {safeScore}
        </span>
      </div>
    );
  }

  // 3. Tasting Card Editor Hero: Master Sommelier Embossed Seal (size="lg")
  return (
    <div
      role="img"
      aria-label={a11yLabel}
      title={a11yLabel}
      className={cn(
        'relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br border-4 shadow-xl flex flex-col items-center justify-center p-3 text-center transition-all duration-300 transform select-none hover:scale-105 shrink-0',
        tier.gradient,
        tier.border,
        tier.glow,
        className
      )}
    >
      {/* Outer Laurel / Barley Ornament Ring */}
      <div className="absolute inset-1.5 rounded-full border border-white/25 border-dashed pointer-events-none" />

      {/* Sparkle Icon for Top Tier (Masterpiece 90+) */}
      {safeScore >= 90 && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full shadow-md animate-pulse flex items-center gap-1 text-[9px] font-display font-black tracking-wider border border-amber-200">
          <Sparkles size={11} className="shrink-0" />
          <span>{language === 'DE' ? 'MEISTERWERK' : 'TOP TIER'}</span>
        </div>
      )}

      {/* Centered Content Stack with Exact Optical Alignment */}
      <div className="flex flex-col items-center justify-center text-center w-full px-2 z-10">
        {/* Badge Ribbon Header - Single Line Never Wrapping */}
        <div className="text-[9.5px] sm:text-[11px] font-display font-black tracking-wider text-white uppercase drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] leading-tight text-center pb-0.5 whitespace-nowrap select-none">
          ★ {language === 'DE' ? tier.badgeDe : tier.badgeEn} ★
        </div>

        {/* Big Bold Score in Exact Geometric Center */}
        <div className="font-display font-black text-5xl sm:text-6xl text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] leading-none tabular-nums text-center">
          {safeScore}
        </div>
      </div>
    </div>
  );
}
