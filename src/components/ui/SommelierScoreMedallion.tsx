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
  // 10. 90-100: Diamond / Diamant
  {
    min: 90,
    max: 100,
    labelEn: 'Diamond / Holy Grail',
    labelDe: 'Diamant / Heiliger Gral',
    badgeEn: 'DIAMOND',
    badgeDe: 'DIAMANT',
    emoji: '💎',
    gradient: 'from-[#0284C7] via-[#0369A1] to-[#082F49]',
    border: 'border-[#7DD3FC]',
    glow: 'shadow-[0_0_22px_rgba(56,189,248,0.55)]',
    colorHex: '#0284C7',
    pillBg: 'bg-sky-500/20 dark:bg-sky-400/25',
    pillBorder: 'border-sky-600/60 dark:border-sky-400/60',
  },
  // 9. 80-89: Platinum / Platin
  {
    min: 80,
    max: 89,
    labelEn: 'Platinum / Masterpiece',
    labelDe: 'Platin / Meisterwerk',
    badgeEn: 'PLATINUM',
    badgeDe: 'PLATIN',
    emoji: '👑',
    gradient: 'from-[#0D9488] via-[#0F766E] to-[#115E59]',
    border: 'border-[#5EEAD4]',
    glow: 'shadow-[0_0_20px_rgba(13,148,136,0.5)]',
    colorHex: '#0D9488',
    pillBg: 'bg-teal-500/20 dark:bg-teal-400/25',
    pillBorder: 'border-teal-600/60 dark:border-teal-400/60',
  },
  // 8. 70-79: Emerald / Smaragd
  {
    min: 70,
    max: 79,
    labelEn: 'Emerald / Reserve',
    labelDe: 'Smaragd / Reserve',
    badgeEn: 'EMERALD',
    badgeDe: 'SMARAGD',
    emoji: '❇️',
    gradient: 'from-[#059669] via-[#047857] to-[#064E3B]',
    border: 'border-[#34D399]',
    glow: 'shadow-[0_0_18px_rgba(16,185,129,0.45)]',
    colorHex: '#059669',
    pillBg: 'bg-emerald-500/20 dark:bg-emerald-400/25',
    pillBorder: 'border-emerald-600/60 dark:border-emerald-400/60',
  },
  // 7. 60-69: Gold / Gold
  {
    min: 60,
    max: 69,
    labelEn: 'Gold / Liquid Gold',
    labelDe: 'Gold / Liquid Gold',
    badgeEn: 'GOLD',
    badgeDe: 'GOLD',
    emoji: '🥇',
    gradient: 'from-[#D97706] via-[#B45309] to-[#78350F]',
    border: 'border-[#FCD34D]',
    glow: 'shadow-[0_0_18px_rgba(245,158,11,0.45)]',
    colorHex: '#D97706',
    pillBg: 'bg-amber-500/20 dark:bg-amber-400/25',
    pillBorder: 'border-amber-600/60 dark:border-amber-400/60',
  },
  // 6. 50-59: Silver / Silber
  {
    min: 50,
    max: 59,
    labelEn: 'Silver / Highly Recommended',
    labelDe: 'Silber / Sehr Empfohlen',
    badgeEn: 'SILVER',
    badgeDe: 'SILBER',
    emoji: '🥈',
    gradient: 'from-[#64748B] via-[#475569] to-[#334155]',
    border: 'border-[#CBD5E1]',
    glow: 'shadow-[0_0_15px_rgba(148,163,184,0.4)]',
    colorHex: '#64748B',
    pillBg: 'bg-slate-400/20 dark:bg-slate-300/25',
    pillBorder: 'border-slate-500/50 dark:border-slate-400/50',
  },
  // 5. 40-49: Bronze / Bronze
  {
    min: 40,
    max: 49,
    labelEn: 'Bronze / Solid Dram',
    labelDe: 'Bronze / Feiner Tropfen',
    badgeEn: 'BRONZE',
    badgeDe: 'BRONZE',
    emoji: '🥉',
    gradient: 'from-[#C2410C] via-[#9A3412] to-[#7C2D12]',
    border: 'border-[#FB923C]',
    glow: 'shadow-[0_0_15px_rgba(217,119,6,0.35)]',
    colorHex: '#C2410C',
    pillBg: 'bg-amber-600/20 dark:bg-amber-500/25',
    pillBorder: 'border-amber-700/50 dark:border-amber-500/50',
  },
  // 4. 30-39: Copper / Kupfer
  {
    min: 30,
    max: 39,
    labelEn: 'Copper / Pot Still Craft',
    labelDe: 'Kupfer / Pot-Still Handwerk',
    badgeEn: 'COPPER',
    badgeDe: 'KUPFER',
    emoji: '⚗️',
    gradient: 'from-[#EA580C] via-[#C2410C] to-[#9A3412]',
    border: 'border-[#FB923C]',
    glow: 'shadow-[0_0_14px_rgba(234,88,12,0.35)]',
    colorHex: '#EA580C',
    pillBg: 'bg-orange-600/20 dark:bg-orange-500/25',
    pillBorder: 'border-orange-700/50 dark:border-orange-500/50',
  },
  // 3. 20-29: Iron / Eisen
  {
    min: 20,
    max: 29,
    labelEn: 'Iron / Everyday Standard',
    labelDe: 'Eisen / Solider Standard',
    badgeEn: 'IRON',
    badgeDe: 'EISEN',
    emoji: '⛓️',
    gradient: 'from-[#475569] via-[#334155] to-[#1E293B]',
    border: 'border-[#94A3B8]',
    glow: 'shadow-[0_0_12px_rgba(100,116,139,0.3)]',
    colorHex: '#475569',
    pillBg: 'bg-slate-600/20 dark:bg-slate-500/25',
    pillBorder: 'border-slate-700/50 dark:border-slate-500/50',
  },
  // 2. 10-19: Rust / Rost
  {
    min: 10,
    max: 19,
    labelEn: 'Rust / Rustic & Raw',
    labelDe: 'Rost / Rustikal & Rau',
    badgeEn: 'RUST',
    badgeDe: 'ROST',
    emoji: '🏜️',
    gradient: 'from-[#B45309] via-[#92400E] to-[#78350F]',
    border: 'border-[#D97706]',
    glow: 'shadow-[0_0_12px_rgba(180,83,9,0.3)]',
    colorHex: '#B45309',
    pillBg: 'bg-amber-700/20 dark:bg-amber-600/25',
    pillBorder: 'border-amber-800/50 dark:border-amber-600/50',
  },
  // 1. 1-9: Wood / Holz
  {
    min: 1,
    max: 9,
    labelEn: 'Wood / Cask Craft',
    labelDe: 'Holz / Fass-Rohbrand',
    badgeEn: 'WOOD',
    badgeDe: 'HOLZ',
    emoji: '🪵',
    gradient: 'from-[#78716C] via-[#57534E] to-[#44403C]',
    border: 'border-[#A8A29E]',
    glow: 'shadow-[0_0_10px_rgba(120,113,108,0.25)]',
    colorHex: '#78716C',
    pillBg: 'bg-stone-500/20 dark:bg-stone-400/25',
    pillBorder: 'border-stone-600/50 dark:border-stone-400/50',
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

      {/* Sparkle Icon for Top Tiers (Platinum & Diamond) - Symmetrically Balanced */}
      {safeScore >= 80 && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full shadow-md animate-pulse flex items-center gap-1 text-[9px] font-display font-black tracking-wider">
          <Sparkles size={11} className="shrink-0" />
          <span>TOP TIER</span>
        </div>
      )}

      {/* Centered Content Stack with Exact Optical Alignment */}
      <div className="flex flex-col items-center justify-center text-center w-full z-10">
        {/* Badge Ribbon Header */}
        <div className="text-xs sm:text-[13px] font-display font-black tracking-widest text-white uppercase drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] leading-tight text-center pb-1">
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
