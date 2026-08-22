'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { scoreToStars } from '@/lib/spirit-utils';

export interface ScoreTierConfig {
  min: number;
  max: number;
  labelEn: string;
  labelDe: string;
  badgeEn: string;
  badgeDe: string;
  emoji: string;
  colorHex: string;
  pillBg: string;
  pillBorder: string;
}

export const SCORE_TIERS_CONFIG: ScoreTierConfig[] = [
  // 1. 90-100: Masterpiece / Meisterwerk
  {
    min: 90,
    max: 100,
    labelEn: 'Masterpiece',
    labelDe: 'Meisterwerk',
    badgeEn: 'MASTERPIECE',
    badgeDe: 'MEISTERWERK',
    emoji: '★',
    colorHex: '#B45309',
    pillBg: 'bg-amber-500/15',
    pillBorder: 'border-amber-600/40',
  },
  // 2. 85-89: Excellent / Ausgezeichnet
  {
    min: 85,
    max: 89,
    labelEn: 'Excellent',
    labelDe: 'Ausgezeichnet',
    badgeEn: 'EXCELLENT',
    badgeDe: 'AUSGEZEICHNET',
    emoji: '★',
    colorHex: '#C2410C',
    pillBg: 'bg-orange-500/15',
    pillBorder: 'border-orange-600/40',
  },
  // 3. 80-84: Very Good / Sehr gut
  {
    min: 80,
    max: 84,
    labelEn: 'Very Good',
    labelDe: 'Sehr gut',
    badgeEn: 'VERY GOOD',
    badgeDe: 'SEHR GUT',
    emoji: '★',
    colorHex: '#2E945D',
    pillBg: 'bg-emerald-500/15',
    pillBorder: 'border-emerald-600/40',
  },
  // 4. 70-79: Good / Gut
  {
    min: 70,
    max: 79,
    labelEn: 'Good',
    labelDe: 'Gut',
    badgeEn: 'GOOD',
    badgeDe: 'GUT',
    emoji: '★',
    colorHex: '#78716C',
    pillBg: 'bg-stone-500/15',
    pillBorder: 'border-stone-600/40',
  },
  // 5. 1-69: Casual / Einfach
  {
    min: 1,
    max: 69,
    labelEn: 'Casual',
    labelDe: 'Einfach',
    badgeEn: 'CASUAL',
    badgeDe: 'EINFACH',
    emoji: '★',
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
  const rawId = React.useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const topPathId = `pathAquaTop-${uid}`;
  const bottomPathId = `pathSloganBottom-${uid}`;
  const halfStarGradId = `halfStar-${uid}`;
  const smokeGradId = `smokeHalo-${uid}`;

  const safeScore = typeof score === 'number' && !isNaN(score) && score > 0 ? Math.max(1, Math.min(100, Math.round(score))) : 85;
  const starRating = scoreToStars(safeScore);
  const tier = getScoreTierConfig(safeScore);
  const a11yLabel = `${safeScore} / 100 - ${language === 'DE' ? tier.labelDe : tier.labelEn} (${starRating} ★)`;

  const sizeClasses =
    size === 'sm'
      ? 'w-11 h-11 sm:w-12 sm:h-12'
      : size === 'md'
      ? 'w-12 h-12 sm:w-13 sm:h-13'
      : 'w-44 h-44 sm:w-48 sm:h-48 md:w-52 md:h-52';

  return (
    <div
      role="img"
      aria-label={a11yLabel}
      title={a11yLabel}
      className={cn(
        'relative shrink-0 select-none transition-transform duration-300 hover:scale-105 bg-transparent mix-blend-multiply opacity-95',
        'text-[#1f1209]',
        sizeClasses,
        className
      )}
    >
      {/* Vector Cask Brand Stamp SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-[0_0_6px_rgba(180,83,9,0.22)] drop-shadow-[0_1.5px_2px_rgba(31,18,9,0.38)]"
        fill="currentColor"
      >
        <defs>
          {/* Curved Text Paths with Mathematical Centering between Ring Radii */}
          <path id={topPathId} d="M 54,250 a 196,196 0 0,1 392,0" fill="none" />
          <path id={bottomPathId} d="M 38,250 a 212,212 0 0,0 424,0" fill="none" />

          {/* Half Star Split Gradient for 0.5 Increments */}
          <linearGradient id={halfStarGradId} x1="0" y1="0" x2="100%" y2="0">
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.15" />
          </linearGradient>

          {/* Singed Parchment Heat Halo / Smoke Ring (Subtle Hot-Iron Brand Effect) */}
          <radialGradient id={smokeGradId} cx="50%" cy="50%" r="50%">
            <stop offset="68%" stopColor="#78350F" stopOpacity="0" />
            <stop offset="88%" stopColor="#B45309" stopOpacity="0.09" />
            <stop offset="96%" stopColor="#542509" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#78350F" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ================= GEBRANNTER SCHMAUCH- & HITZEHOF (SMOKE VIGNETTE) ================= */}
        <circle cx="250" cy="250" r="248" fill={`url(#${smokeGradId})`} pointerEvents="none" />

        {/* ================= ÄUSSERER DOPPELRING (SCHLANK & ELEGANT) ================= */}
        <circle cx="250" cy="250" r="240" fill="none" stroke="currentColor" strokeWidth="6" />
        <circle cx="250" cy="250" r="230" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4,3" />

        {/* ================= INNERER DOPPELRING ================= */}
        <circle cx="250" cy="250" r="180" fill="none" stroke="currentColor" strokeWidth="3.5" />
        <circle cx="250" cy="250" r="174" fill="none" stroke="currentColor" strokeWidth="1.2" />

        {/* ================= TEXT ZWISCHEN DEN RINGEN ================= */}
        {/* Oben: AQUA VITAEUM (Groß & Präsent) */}
        <text
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="bold"
          fontSize="31"
          letterSpacing="9"
          fill="currentColor"
        >
          <textPath href={`#${topPathId}`} startOffset="50%" textAnchor="middle">
            AQUA VITAEUM
          </textPath>
        </text>

        {/* Flankierende 3er-Sterne-Konstellation Links (Dem Bogen folgend) */}
        <g>
          {/* Oberer Begleitstern */}
          <g transform="translate(46, 230) scale(1)">
            <polygon points="0,-7 2.1,-2.3 7.3,-2.3 3.1,1.1 4.7,6.1 0,3.1 -4.7,6.1 -3.1,1.1 -7.3,-2.3 -2.1,-2.3" fill="currentColor" />
          </g>
          {/* Zentraler Hauptstern */}
          <g transform="translate(44, 250) scale(1.45)">
            <polygon points="0,-7 2.1,-2.3 7.3,-2.3 3.1,1.1 4.7,6.1 0,3.1 -4.7,6.1 -3.1,1.1 -7.3,-2.3 -2.1,-2.3" fill="currentColor" />
          </g>
          {/* Unterer Begleitstern */}
          <g transform="translate(46, 270) scale(1)">
            <polygon points="0,-7 2.1,-2.3 7.3,-2.3 3.1,1.1 4.7,6.1 0,3.1 -4.7,6.1 -3.1,1.1 -7.3,-2.3 -2.1,-2.3" fill="currentColor" />
          </g>
        </g>

        {/* Flankierende 3er-Sterne-Konstellation Rechts (Dem Bogen folgend) */}
        <g>
          {/* Oberer Begleitstern */}
          <g transform="translate(454, 230) scale(1)">
            <polygon points="0,-7 2.1,-2.3 7.3,-2.3 3.1,1.1 4.7,6.1 0,3.1 -4.7,6.1 -3.1,1.1 -7.3,-2.3 -2.1,-2.3" fill="currentColor" />
          </g>
          {/* Zentraler Hauptstern */}
          <g transform="translate(456, 250) scale(1.45)">
            <polygon points="0,-7 2.1,-2.3 7.3,-2.3 3.1,1.1 4.7,6.1 0,3.1 -4.7,6.1 -3.1,1.1 -7.3,-2.3 -2.1,-2.3" fill="currentColor" />
          </g>
          {/* Unterer Begleitstern */}
          <g transform="translate(454, 270) scale(1)">
            <polygon points="0,-7 2.1,-2.3 7.3,-2.3 3.1,1.1 4.7,6.1 0,3.1 -4.7,6.1 -3.1,1.1 -7.3,-2.3 -2.1,-2.3" fill="currentColor" />
          </g>
        </g>

        {/* Feine Verbindungs-Linien entlang des Kreisbogens zu den Texten (Mit großzügigem Text-Abstand) */}
        {/* Links Oben */}
        <path d="M 52,216 A 205,205 0 0,1 64,163" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3,3" opacity="0.65" />
        <circle cx="64" cy="163" r="2.2" fill="currentColor" />
        
        {/* Links Unten */}
        <path d="M 52,284 A 205,205 0 0,0 64,337" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3,3" opacity="0.65" />
        <circle cx="64" cy="337" r="2.2" fill="currentColor" />

        {/* Rechts Oben */}
        <path d="M 448,216 A 205,205 0 0,0 436,163" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3,3" opacity="0.65" />
        <circle cx="436" cy="163" r="2.2" fill="currentColor" />

        {/* Rechts Unten */}
        <path d="M 448,284 A 205,205 0 0,1 436,337" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3,3" opacity="0.65" />
        <circle cx="436" cy="337" r="2.2" fill="currentColor" />

        {/* Unten: Slogan FINE SPIRITS JOURNAL (Weit geschwungener Halbkreis) */}
        <text
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="bold"
          fontSize="21"
          letterSpacing="7"
          fill="currentColor"
        >
          <textPath href={`#${bottomPathId}`} startOffset="50%" textAnchor="middle">
            FINE SPIRITS JOURNAL
          </textPath>
        </text>

        {/* ================= INNENBEREICH / BEWERTUNG ================= */}
        <text
          x="250"
          y="135"
          fontFamily="'Inter', system-ui, sans-serif"
          fontWeight="bold"
          fontSize="12.5"
          letterSpacing="3"
          textAnchor="middle"
          fill="currentColor"
          opacity="0.85"
        >
          OFFICIAL RATING
        </text>
        <text
          x="250"
          y="164"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="900"
          fontSize="24"
          letterSpacing="2.5"
          textAnchor="middle"
          fill="currentColor"
        >
          {language === 'DE' ? tier.badgeDe : tier.badgeEn}
        </text>

        <line x1="140" y1="178" x2="360" y2="178" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.75" />

        {/* 5 Sterne Bewertung (Präzise 5% Feintuning) */}
        <g transform="translate(250, 214)">
          {/* Stern 1 */}
          <g transform="translate(-92, 0) scale(2.5)">
            <polygon
              points="0,-6 1.8,-1.9 6.3,-1.9 2.7,0.9 4,5.2 0,2.6 -4,5.2 -2.7,0.9 -6.3,-1.9 -1.8,-1.9"
              fill={starRating >= 1 ? 'currentColor' : starRating >= 0.5 ? `url(#${halfStarGradId})` : 'currentColor'}
              fillOpacity={starRating >= 1 ? 1 : starRating >= 0.5 ? 1 : 0.12}
              stroke="currentColor"
              strokeWidth={starRating >= 1 ? 0 : 0.9}
              strokeOpacity={starRating >= 1 ? 0 : 0.6}
            />
          </g>
          {/* Stern 2 */}
          <g transform="translate(-46, 0) scale(2.5)">
            <polygon
              points="0,-6 1.8,-1.9 6.3,-1.9 2.7,0.9 4,5.2 0,2.6 -4,5.2 -2.7,0.9 -6.3,-1.9 -1.8,-1.9"
              fill={starRating >= 2 ? 'currentColor' : starRating >= 1.5 ? `url(#${halfStarGradId})` : 'currentColor'}
              fillOpacity={starRating >= 2 ? 1 : starRating >= 1.5 ? 1 : 0.12}
              stroke="currentColor"
              strokeWidth={starRating >= 2 ? 0 : 0.9}
              strokeOpacity={starRating >= 2 ? 0 : 0.6}
            />
          </g>
          {/* Stern 3 (Zentraler Hero-Stern) */}
          <g transform="translate(0, -4.5) scale(3.1)">
            <polygon
              points="0,-6 1.8,-1.9 6.3,-1.9 2.7,0.9 4,5.2 0,2.6 -4,5.2 -2.7,0.9 -6.3,-1.9 -1.8,-1.9"
              fill={starRating >= 3 ? 'currentColor' : starRating >= 2.5 ? `url(#${halfStarGradId})` : 'currentColor'}
              fillOpacity={starRating >= 3 ? 1 : starRating >= 2.5 ? 1 : 0.12}
              stroke="currentColor"
              strokeWidth={starRating >= 3 ? 0 : 0.9}
              strokeOpacity={starRating >= 3 ? 0 : 0.6}
            />
          </g>
          {/* Stern 4 */}
          <g transform="translate(46, 0) scale(2.5)">
            <polygon
              points="0,-6 1.8,-1.9 6.3,-1.9 2.7,0.9 4,5.2 0,2.6 -4,5.2 -2.7,0.9 -6.3,-1.9 -1.8,-1.9"
              fill={starRating >= 4 ? 'currentColor' : starRating >= 3.5 ? `url(#${halfStarGradId})` : 'currentColor'}
              fillOpacity={starRating >= 4 ? 1 : starRating >= 3.5 ? 1 : 0.12}
              stroke="currentColor"
              strokeWidth={starRating >= 4 ? 0 : 0.9}
              strokeOpacity={starRating >= 4 ? 0 : 0.6}
            />
          </g>
          {/* Stern 5 */}
          <g transform="translate(92, 0) scale(2.5)">
            <polygon
              points="0,-6 1.8,-1.9 6.3,-1.9 2.7,0.9 4,5.2 0,2.6 -4,5.2 -2.7,0.9 -6.3,-1.9 -1.8,-1.9"
              fill={starRating >= 5 ? 'currentColor' : starRating >= 4.5 ? `url(#${halfStarGradId})` : 'currentColor'}
              fillOpacity={starRating >= 5 ? 1 : starRating >= 4.5 ? 1 : 0.12}
              stroke="currentColor"
              strokeWidth={starRating >= 5 ? 0 : 0.9}
              strokeOpacity={starRating >= 5 ? 0 : 0.6}
            />
          </g>
        </g>

        {/* Zentrum: Maximized Hero Score Numeral */}
        <text
          x="250"
          y="342"
          fontFamily="'Playfair Display', Georgia, serif"
          fontWeight="900"
          fontSize="124"
          letterSpacing="0"
          textAnchor="middle"
          fill="currentColor"
        >
          {safeScore}
        </text>
      </svg>
    </div>
  );
}
