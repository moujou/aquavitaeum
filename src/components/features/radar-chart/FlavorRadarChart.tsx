'use client';

import React, { useState, useEffect } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { FlavorProfile } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { t as translate } from '@/lib/i18n/translations';
import {
  SPIRIT_FLAVOR_TAXONOMY,
  getDescriptorsByRadarDimension,
  getDescriptorsByCategory,
  translateFlavorTag,
  getCategoryByDescriptorId,
} from '@/data/spirit-flavor-taxonomy';
import { isTagSelected } from '@/components/features/flavor-tags/FlavorTagSelector';
import { SectionHeader } from '@/components/ui/SectionHeader';
import {
  WhiskyAromaWheel,
  SensoryFilterMode,
  CATEGORY_WHEEL_COLORS,
  HoveredAromaNode,
  computeActiveCategoriesData,
  SommelierCategoryLegendAndInspector,
} from './WhiskyAromaWheel';
import { Compass, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customized } from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VisualizerViewMode = 'wheel' | 'radar';

interface FlavorRadarChartProps {
  noseProfile: FlavorProfile;
  tasteProfile: FlavorProfile;
  noseFlavorTags?: string[];
  tasteFlavorTags?: string[];
  noseTagIntensities?: Record<string, number>;
  tasteTagIntensities?: Record<string, number>;
  onSelectTag?: (tagName: string) => void;
  className?: string;
}

interface DynamicProfileSlidersProps {
  title: string;
  type: 'nose' | 'taste';
  activeTags: string[];
  tagIntensities: Record<string, number>;
  onIntensityChange: (tagName: string, value: number) => void;
  className?: string;
}

interface SingleProfileSlidersProps {
  title: string;
  profile: FlavorProfile;
  type: 'nose' | 'taste';
  onChange: (key: keyof FlavorProfile, value: number) => void;
  className?: string;
}

// ─── 9 Canonical Taxonomy Radar Dimensions (Natural Clockwise Sensory Sequence) ───

export const CANONICAL_RADAR_CATEGORIES = [
  { key: 'fruity' as keyof FlavorProfile,   taxonomyId: 'fruchtig',   labelEn: 'Fruity, Tropical & Citrus', labelDe: 'Früchte, Tropisch & Zitrus', shortEn: 'Fruit', shortDe: 'Früchte', emoji: '🍌', color: '#E11D48' },
  { key: 'winey' as keyof FlavorProfile,    taxonomyId: 'weinartig',  labelEn: 'Dried Fruit & Wine',    labelDe: 'Trockenobst & Wein',     shortEn: 'Dried Fruit & Wine', shortDe: 'Trockenobst & Wein', emoji: '🍇', color: '#881337' },
  { key: 'cereal' as keyof FlavorProfile,   taxonomyId: 'suesse',     labelEn: 'Sweet, Malt & Grain',   labelDe: 'Süß & Getreide',        shortEn: 'Sweetness', shortDe: 'Süße', emoji: '🍯', color: '#D97706' },
  { key: 'woody' as keyof FlavorProfile,    taxonomyId: 'holzig',     labelEn: 'Oak & Wood',            labelDe: 'Eichenholz & Fass',     shortEn: 'Wood & Oak', shortDe: 'Holz & Fass', emoji: '🪵', color: '#854D0E' },
  { key: 'spicy' as keyof FlavorProfile,    taxonomyId: 'wuerzig',    labelEn: 'Spices & Pepper',       labelDe: 'Würzig & Pfeffrig',     shortEn: 'Spices', shortDe: 'Gewürze', emoji: '🌶️', color: '#EA580C' },
  { key: 'floral' as keyof FlavorProfile,   taxonomyId: 'pflanzlich', labelEn: 'Herbal & Green',        labelDe: 'Kräuter, Laub & Grasig', shortEn: 'Herbal', shortDe: 'Kräuter', emoji: '🌿', color: '#16A34A' },
  { key: 'sulphury' as keyof FlavorProfile, taxonomyId: 'maritim',   labelEn: 'Maritime & Mineral',    labelDe: 'Maritim & Mineralisch', shortEn: 'Maritime', shortDe: 'Maritim', emoji: '🌊', color: '#0284C7' },
  { key: 'peaty' as keyof FlavorProfile,    taxonomyId: 'torf',       labelEn: 'Peat & Smoke',          labelDe: 'Torf & Rauch',          shortEn: 'Peat & Smoke', shortDe: 'Torf & Rauch', emoji: '🔥', color: '#DC2626' },
  { key: 'feinty' as keyof FlavorProfile,   taxonomyId: 'feinty',     labelEn: 'Leather, Meaty & Feinty', labelDe: 'Leder, Fleischig & Wachs', shortEn: 'Leather & Wax', shortDe: 'Leder & Wachs', emoji: '🐂', color: '#A16207' },
] as const;

// Backward-compatible DIMENSIONS export
export const DIMENSIONS = CANONICAL_RADAR_CATEGORIES.map((c) => ({
  key: c.key,
  label: c.labelEn,
}));

// Helper to compute radar dimension score from active tag intensities using arithmetic average (Summe / Anzahl)
export function computeRadarDimensionScore(
  dimKey: keyof FlavorProfile,
  activeTags: string[],
  tagIntensities: Record<string, number>,
  taxonomyId?: string,
): number {
  const dimDescriptors = taxonomyId
    ? getDescriptorsByCategory(taxonomyId)
    : getDescriptorsByRadarDimension(dimKey);
  const activeForDim = dimDescriptors.filter((d) => isTagSelected(d, activeTags));

  if (activeForDim.length === 0) {
    return 0;
  }

  const scores = activeForDim.map((d) => {
    const tagName = d.name.EN;
    const deName = d.name.DE;
    return (
      tagIntensities[tagName] ??
      tagIntensities[deName] ??
      tagIntensities[d.id] ??
      5
    );
  });

  const sum = scores.reduce((a, b) => a + b, 0);
  const avg = sum / scores.length;
  return Number(avg.toFixed(1));
}

// Calculate straight linear polygon path with precision-rounded vertex corners (Fillet Radius) for 100% data fidelity & center 0-anchors
export function getPrecisionRoundedPolygonPath(
  points: { x: number; y: number }[],
  radius = 5
): string {
  const n = points.length;
  if (n < 3) {
    if (n === 2) return `M ${points[0].x},${points[0].y} L ${points[1].x},${points[1].y}`;
    return '';
  }

  let path = '';

  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const curr = points[i];
    const next = points[(i + 1) % n];

    const dPrev = Math.hypot(curr.x - prev.x, curr.y - prev.y);
    const dNext = Math.hypot(next.x - curr.x, next.y - curr.y);

    // If consecutive points are both at center (d < 0.5), connect directly without fillet
    if (dPrev < 0.5 || dNext < 0.5) {
      if (i === 0) path += `M ${curr.x.toFixed(2)},${curr.y.toFixed(2)}`;
      else path += ` L ${curr.x.toFixed(2)},${curr.y.toFixed(2)}`;
      continue;
    }

    // Constrain corner radius so it never exceeds 1/3 of the shortest adjacent edge
    const r = Math.min(radius, dPrev / 3, dNext / 3);

    // Incoming tangent point along the straight edge
    const inX = curr.x - ((curr.x - prev.x) / dPrev) * r;
    const inY = curr.y - ((curr.y - prev.y) / dPrev) * r;

    // Outgoing tangent point along the straight edge
    const outX = curr.x + ((next.x - curr.x) / dNext) * r;
    const outY = curr.y + ((next.y - curr.y) / dNext) * r;

    if (i === 0) {
      path += `M ${inX.toFixed(2)},${inY.toFixed(2)}`;
    } else {
      path += ` L ${inX.toFixed(2)},${inY.toFixed(2)}`;
    }

    path += ` Q ${curr.x.toFixed(2)},${curr.y.toFixed(2)} ${outX.toFixed(2)},${outY.toFixed(2)}`;
  }

  return path + ' Z';
}

// Aliases for backwards compatibility
export const getHarmoniousSensorySplinePath = getPrecisionRoundedPolygonPath;
export const getSmoothClosedSplinePath = getPrecisionRoundedPolygonPath;

interface SensoryRadarPoint {
  x: number;
  y: number;
  value?: number;
  cx?: number;
  cy?: number;
  angle?: number;
  payload?: {
    taxonomyId?: string;
    dimension?: string;
    [key: string]: unknown;
  };
}

interface ActiveSensoryShapeProps {
  points?: SensoryRadarPoint[];
  stroke?: string;
  fill?: string;
  fillOpacity?: number;
  activeCategoryId?: string | null;
  sensoryType?: 'nose' | 'taste';
}

// State-of-the-Art Sensory Shape: True 9-Axis Center-Anchored Polygon + Jewel Glass Nodes + Precision Pills
function ActiveSensoryShape({
  points = [],
  stroke,
  fill,
  fillOpacity,
  activeCategoryId,
  sensoryType,
}: ActiveSensoryShapeProps) {
  if (!points || !points.length) return null;

  // Check if at least one dimension has a score > 0
  const hasActiveData = points.some((p) => p && typeof p.value === 'number' && p.value > 0);
  if (!hasActiveData) return null;

  // Use full 9 points with 0-scores anchored at center (cx, cy)
  const polyPath = getPrecisionRoundedPolygonPath(points, 5);
  const isFocusMode = Boolean(activeCategoryId);
  const gradientFill = sensoryType === 'nose' ? 'url(#radarNoseGrad)' : sensoryType === 'taste' ? 'url(#radarTasteGrad)' : fill;

  const activePoints = points.filter((p) => p && typeof p.value === 'number' && p.value > 0);

  return (
    <g className="pointer-events-none transition-all duration-300">
      {/* 1. Full 9-Axis Polygon dipping to center (0) for inactive dimensions */}
      <path
        d={polyPath}
        fill={gradientFill}
        fillOpacity={isFocusMode ? 0.08 : (fillOpacity ?? 0.85)}
        stroke={stroke}
        strokeWidth={isFocusMode ? 1.8 : 3.2}
        strokeOpacity={isFocusMode ? 0.25 : 1}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="transition-all duration-300 drop-shadow-md"
      />

      {/* 2. Jewel Glass Vertex Nodes ONLY on active points (> 0) */}
      {activePoints.map((pt, idx) => {
        const isPointActive = pt.payload?.taxonomyId === activeCategoryId;

        return (
          <g key={`node-${idx}`} className="transition-all duration-300">
            {/* Pulsing Double Breathing Halo Ring for active category point */}
            {isPointActive && (
              <>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={15}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={1.5}
                  opacity={0.5}
                  strokeDasharray="3,3"
                  className="animate-spin-slow"
                />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={11}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={2}
                  opacity={0.8}
                  className="animate-pulse"
                />
              </>
            )}

            {/* Jewel Glass Node */}
            <circle
              cx={pt.x}
              cy={pt.y}
              r={isPointActive ? 7.5 : 5}
              fill={stroke}
              stroke="#FFFFFF"
              strokeWidth={isPointActive ? 2.5 : 1.8}
              opacity={isFocusMode && !isPointActive ? 0.15 : 1}
              className="drop-shadow-sm transition-all duration-300"
            />

            {/* Specular White Highlight inside node */}
            <circle
              cx={pt.x - (isPointActive ? 2 : 1.2)}
              cy={pt.y - (isPointActive ? 2 : 1.2)}
              r={isPointActive ? 2.2 : 1.4}
              fill="#FFFFFF"
              opacity={isFocusMode && !isPointActive ? 0.15 : 0.85}
              className="transition-all duration-300"
            />

            {/* Score Value Pill for active point (Single Note Score or Average Ø Score) */}
            {isPointActive && (
              <g className="drop-shadow-md">
                <rect
                  x={pt.x - 22}
                  y={pt.y - 26}
                  width={44}
                  height={20}
                  rx={10}
                  fill="var(--pub-bg-panel)"
                  stroke={stroke}
                  strokeWidth={2}
                />
                <text
                  x={pt.x}
                  y={pt.y - 15.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight="900"
                  fontFamily="'Inter', system-ui, sans-serif"
                  fill="var(--foreground)"
                  className="tabular-nums select-none tracking-tight"
                >
                  Ø {pt.value}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

// ─── Main Component: Visualizer Toolbar + Dual Chart Engine ────────────────────

export function FlavorRadarChart({
  noseFlavorTags = [],
  tasteFlavorTags = [],
  noseTagIntensities = {},
  tasteTagIntensities = {},
  onSelectTag,
  className,
}: FlavorRadarChartProps) {
  const { language } = useLanguage();
  const [viewMode, setViewMode] = useState<VisualizerViewMode>('radar');
  const [sensoryMode, setSensoryMode] = useState<SensoryFilterMode>('both');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [pinnedNode, setPinnedNode] = useState<HoveredAromaNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<HoveredAromaNode | null>(null);
  const activeNode = hoveredNode || pinnedNode;

  const togglePin = (node: HoveredAromaNode, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPinnedNode((prev) => {
      if (!prev) return node;

      // 1. If clicking the same category that is currently active (whether at category or descriptor level), toggle OFF
      if (node.type === 'category') {
        if (prev.categoryId === node.categoryId) {
          setHoveredNode(null);
          return null;
        }
        return node;
      }

      // 2. If clicking a descriptor that is already selected, toggle back to category level
      if (node.type === 'descriptor') {
        if (prev.type === 'descriptor' && prev.tagName === node.tagName && prev.categoryId === node.categoryId) {
          setHoveredNode(null);
          return {
            type: 'category',
            categoryId: node.categoryId,
            categoryName: node.categoryName,
            categoryEmoji: node.categoryEmoji,
            score: node.score,
            color: node.color,
          };
        }
        return node;
      }

      // 3. Fallback matching
      if (
        prev.type === node.type &&
        prev.categoryId === node.categoryId &&
        prev.tagName === node.tagName
      ) {
        setHoveredNode(null);
        return null;
      }
      return node;
    });
  };

  const clearSelection = () => {
    setPinnedNode(null);
    setHoveredNode(null);
  };

  const activeTags = React.useMemo(() => {
    if (sensoryMode === 'nose') return noseFlavorTags;
    if (sensoryMode === 'taste') return tasteFlavorTags;
    return Array.from(new Set([...noseFlavorTags, ...tasteFlavorTags]));
  }, [sensoryMode, noseFlavorTags, tasteFlavorTags]);

  const tagIntensities = React.useMemo(() => {
    const combined: Record<string, number> = {};
    if (sensoryMode === 'nose' || sensoryMode === 'both') {
      Object.assign(combined, noseTagIntensities);
    }
    if (sensoryMode === 'taste' || sensoryMode === 'both') {
      Object.entries(tasteTagIntensities).forEach(([k, v]) => {
        combined[k] = Math.max(combined[k] ?? 0, v);
      });
    }
    return combined;
  }, [sensoryMode, noseTagIntensities, tasteTagIntensities]);

  const activeCategoriesData = React.useMemo(() => {
    return computeActiveCategoriesData(activeTags, tagIntensities);
  }, [activeTags, tagIntensities]);

  // Chart data for 9 Canonical Radar categories
  const chartData = CANONICAL_RADAR_CATEGORIES.map(({ key, taxonomyId, labelEn, labelDe, shortEn, shortDe, emoji, color }) => {
    const noseScore = computeRadarDimensionScore(key, noseFlavorTags, noseTagIntensities, taxonomyId);
    const tasteScore = computeRadarDimensionScore(key, tasteFlavorTags, tasteTagIntensities, taxonomyId);

    const dimDescriptors = getDescriptorsByCategory(taxonomyId);
    
    const activeNoseNotes = dimDescriptors
      .filter((d) => isTagSelected(d, noseFlavorTags))
      .map((d) => {
        const name = d.name[language] ?? d.name.EN;
        const intensity =
          noseTagIntensities[d.name.EN] ??
          noseTagIntensities[d.name.DE] ??
          noseTagIntensities[d.id] ??
          5;
        return { id: d.id, name, intensity, sensoryType: 'nose' as const };
      });

    const activeTasteNotes = dimDescriptors
      .filter((d) => isTagSelected(d, tasteFlavorTags))
      .map((d) => {
        const name = d.name[language] ?? d.name.EN;
        const intensity =
          tasteTagIntensities[d.name.EN] ??
          tasteTagIntensities[d.name.DE] ??
          tasteTagIntensities[d.id] ??
          5;
        return { id: d.id, name, intensity, sensoryType: 'taste' as const };
      });

    const activeNoseDesc = activeNoseNotes.map((d) => d.name);
    const activeTasteDesc = activeTasteNotes.map((d) => d.name);

    return {
      dimensionKey: key,
      taxonomyId,
      dimension: language === 'DE' ? labelDe : labelEn,
      shortDimension: language === 'DE' ? shortDe : shortEn,
      emoji,
      color,
      Nose: noseScore,
      Taste: tasteScore,
      activeNoseTags: activeNoseDesc,
      activeTasteTags: activeTasteDesc,
      activeNoseNotes,
      activeTasteNotes,
    };
  });

  const noseLegend = language === 'DE' ? 'Nase' : 'Nose';
  const tasteLegend = language === 'DE' ? 'Geschmack' : 'Taste';

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      {/* ─── Top Control Toolbar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] px-3 py-2 rounded-lg shadow-2xs">
        {/* 1. Visualizer View Toggle (Netzdiagramm vs Aromenrad) */}
        <div className="inline-flex rounded-lg p-0.5 bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] gap-0.5 select-none h-[34px] items-center">
          <button
            type="button"
            onClick={() => {
              clearSelection();
              setViewMode('radar');
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-display font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer h-[28px]',
              viewMode === 'radar'
                ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
            )}
            title={language === 'DE' ? 'Netzdiagramm (Spider)' : 'Radar Chart (Spider)'}
          >
            <Compass size={14} className={viewMode === 'radar' ? 'text-[var(--brass-accent)]' : 'text-[var(--sepia-muted)]'} />
            <span>{translate('visualizerMode_radar', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              clearSelection();
              setViewMode('wheel');
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-display font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer h-[28px]',
              viewMode === 'wheel'
                ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
            )}
            title={language === 'DE' ? 'Aromenrad (Sunburst)' : 'Aroma Wheel (Sunburst)'}
          >
            <PieChart size={14} className={viewMode === 'wheel' ? 'text-[var(--brass-accent)]' : 'text-[var(--sepia-muted)]'} />
            <span>{translate('visualizerMode_wheel', language)}</span>
          </button>
        </div>

        {/* 2. 3-Way Sensory Filter Toggle (Beide | Nase | Gaumen) */}
        <div className="inline-flex rounded-lg p-0.5 bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] gap-0.5 select-none h-[34px] items-center">
          <button
            type="button"
            onClick={() => {
              clearSelection();
              setSensoryMode('both');
            }}
            className={cn(
              'flex items-center justify-center px-3 py-1.5 rounded-md font-display font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer h-[28px]',
              sensoryMode === 'both'
                ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
            )}
          >
            {translate('sensoryFilter_all', language)}
          </button>

          <button
            type="button"
            onClick={() => {
              clearSelection();
              setSensoryMode('nose');
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-display font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer h-[28px]',
              sensoryMode === 'nose'
                ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0 transition-all',
                sensoryMode === 'nose'
                  ? 'bg-[var(--sensory-nose)] shadow-[0_0_6px_var(--sensory-nose)] ring-1 ring-white/60'
                  : 'bg-[var(--sensory-nose)]/40'
              )}
            />
            <span>{translate('sensoryFilter_nose', language)}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              clearSelection();
              setSensoryMode('taste');
            }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md font-display font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer h-[28px]',
              sensoryMode === 'taste'
                ? 'bg-[var(--wood-selection)] text-[var(--parchment-bg)] shadow-xs'
                : 'text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-black/5'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full shrink-0 transition-all',
                sensoryMode === 'taste'
                  ? 'bg-[var(--sensory-taste)] shadow-[0_0_6px_var(--sensory-taste)] ring-1 ring-white/60'
                  : 'bg-[var(--sensory-taste)]/40'
              )}
            />
            <span>{translate('sensoryFilter_taste', language)}</span>
          </button>
        </div>
      </div>

      {/* ─── Visualizer Canvas ─── */}
      <div className="w-full flex justify-center bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-lg p-1 sm:p-3 lg:p-4 shadow-inner overflow-hidden select-none">
        {viewMode === 'wheel' ? (
          <WhiskyAromaWheel
            noseFlavorTags={noseFlavorTags}
            tasteFlavorTags={tasteFlavorTags}
            noseTagIntensities={noseTagIntensities}
            tasteTagIntensities={tasteTagIntensities}
            sensoryMode={sensoryMode}
            onSelectTag={onSelectTag}
            pinnedNode={pinnedNode}
            hoveredNode={hoveredNode}
            onTogglePin={togglePin}
            onHoverNode={setHoveredNode}
            onClearSelection={clearSelection}
          />
        ) : (
          <div className="w-full flex flex-col items-center gap-3">
            <div className="w-full h-[380px] xs:h-[400px] sm:h-[500px] md:h-[580px] lg:h-[640px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  data={chartData}
                  outerRadius={isMobile ? '92%' : '88%'}
                  margin={
                    isMobile
                      ? { top: 8, right: 8, bottom: 8, left: 8 }
                      : { top: 12, right: 45, bottom: 12, left: 45 }
                  }
                >
                  <defs>
                    {/* 1. Scottish Amber Radial Mesh Gradient for Nose */}
                    <radialGradient id="radarNoseGrad" cx="50%" cy="50%" r="65%">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.45" />
                      <stop offset="55%" stopColor="#D97706" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#B45309" stopOpacity="0.14" />
                    </radialGradient>

                    {/* 2. Sea Teal Radial Mesh Gradient for Taste */}
                    <radialGradient id="radarTasteGrad" cx="50%" cy="50%" r="65%">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.45" />
                      <stop offset="55%" stopColor="#0D9488" stopOpacity="0.30" />
                      <stop offset="100%" stopColor="#0F766E" stopOpacity="0.14" />
                    </radialGradient>

                    {/* 3. Center Astrolabe Medallion Radial Gradient */}
                    <radialGradient id="radarHubGrad" cx="45%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="var(--parchment-bg)" />
                      <stop offset="75%" stopColor="var(--parchment-bg-alt)" />
                      <stop offset="100%" stopColor="var(--parchment-border)" />
                    </radialGradient>
                  </defs>

                  <PolarGrid stroke="var(--parchment-border)" strokeOpacity={activeNode ? 0.3 : 0.8} strokeWidth={1.2} />
                  <PolarAngleAxis
                    dataKey="shortDimension"
                    tick={({
                      payload,
                      x: rawX,
                      y: rawY,
                      cx: rawCx,
                      cy: rawCy,
                    }: {
                      payload?: { value?: unknown };
                      x?: string | number;
                      y?: string | number;
                      cx?: number;
                      cy?: number;
                    } = {}) => {
                      const displayVal = String(payload?.value ?? '');
                      const item = chartData.find(
                        (d) => d.shortDimension === displayVal || d.dimension === displayVal
                      );
                      const catData = activeCategoriesData.find((c) => c.category.id === item?.taxonomyId);
                      const isSelected = activeNode?.categoryId === item?.taxonomyId;
                      const isActive =
                        sensoryMode === 'both'
                          ? (item?.Nose ?? 0) > 0 || (item?.Taste ?? 0) > 0
                          : sensoryMode === 'nose'
                          ? (item?.Nose ?? 0) > 0
                          : (item?.Taste ?? 0) > 0;

                      const maxScore =
                        catData?.activeDescriptors.reduce((m, d) => Math.max(m, d.intensity), 0) ??
                        Math.max(item?.Nose ?? 0, item?.Taste ?? 0);

                      const catNodeData: HoveredAromaNode | null = catData
                        ? {
                            type: 'category',
                            categoryId: catData.category.id,
                            categoryName: catData.category.name[language],
                            categoryEmoji: catData.category.emoji,
                            score: maxScore,
                            tagCount: catData.activeDescriptors.length,
                            color: CATEGORY_WHEEL_COLORS[catData.category.id]?.base || item?.color,
                          }
                        : null;

                      const x = Number(rawX ?? 0);
                      const y = Number(rawY ?? 0);
                      const cx = rawCx ?? 0;
                      const cy = rawCy ?? 0;

                      const dx = x - cx;
                      const dy = y - cy;
                      const len = Math.hypot(dx, dy) || 1;
                      const ux = dx / len;
                      const uy = dy / len;

                      // Push text outward along the radial spoke vector by 4px
                      const offsetX = ux * 4;
                      const offsetY = uy * 4;

                      // Relative coordinates of center and outer spoke perimeter inside this translated group
                      const cRelX = cx - (x + offsetX);
                      const cRelY = cy - (y + offsetY);
                      const tipRelX = -offsetX;
                      const tipRelY = -offsetY;

                      // Collect individual notes for Flavor Beads on the active spoke
                      const allNotesForSpoke = [
                        ...(sensoryMode === 'nose' || sensoryMode === 'both' ? (item?.activeNoseNotes ?? []) : []),
                        ...(sensoryMode === 'taste' || sensoryMode === 'both' ? (item?.activeTasteNotes ?? []) : []),
                      ];

                      // If a single note (descriptor) is selected, isolate ONLY that note on the line!
                      const activeNotesForSpoke =
                        activeNode?.type === 'descriptor' && activeNode?.tagName
                          ? allNotesForSpoke.filter(
                              (n) =>
                                n.name.toLowerCase() === activeNode.tagName?.toLowerCase() ||
                                n.id === activeNode.tagName
                            )
                          : allNotesForSpoke;

                      // Group notes by intensity to prevent overlapping badges on identical or near scores
                      interface ClusteredSpokeBead {
                        intensity: number;
                        notes: Array<{ id: string; name: string; sensoryType: 'nose' | 'taste' }>;
                      }

                      const clusteredBeads: ClusteredSpokeBead[] = [];
                      activeNotesForSpoke.forEach((note) => {
                        const existing = clusteredBeads.find((b) => Math.abs(b.intensity - note.intensity) < 0.5);
                        if (existing) {
                          existing.notes.push(note);
                        } else {
                          clusteredBeads.push({
                            intensity: note.intensity,
                            notes: [note],
                          });
                        }
                      });
                      clusteredBeads.sort((a, b) => a.intensity - b.intensity);

                      // Determine optimal text-anchor so text expands away from the chart center
                      let anchor: 'start' | 'middle' | 'end' = 'middle';
                      if (ux > 0.25) anchor = 'start';
                      else if (ux < -0.25) anchor = 'end';

                      // Vertical baseline adjustment
                      let baseline: 'auto' | 'middle' | 'hanging' = 'middle';
                      if (uy < -0.25) baseline = 'auto'; // Top pole: text sits above point
                      else if (uy > 0.25) baseline = 'hanging'; // Bottom pole: text hangs below point

                      return (
                        <g
                          transform={`translate(${x + offsetX},${y + offsetY})`}
                          className="cursor-pointer transition-all duration-200"
                          onClick={(e) => {
                            if (catNodeData) togglePin(catNodeData, e);
                          }}
                          onMouseEnter={() => {
                            if (catNodeData) setHoveredNode(catNodeData);
                          }}
                          onMouseLeave={() => {
                            setHoveredNode(null);
                          }}
                        >
                          {/* ─── Active Spotlight Measuring Spoke with Scale Notches & Clean Numeric Flavor Beads ─── */}
                          {isSelected && (
                            <g className="pointer-events-none">
                              {/* 1. Glowing Continuous Beam from Center (0) to Perimeter (10) */}
                              <line
                                x1={cRelX}
                                y1={cRelY}
                                x2={tipRelX}
                                y2={tipRelY}
                                stroke="var(--wood-selection)"
                                strokeWidth={3}
                                strokeLinecap="round"
                                strokeOpacity={0.95}
                                className="drop-shadow-md"
                              />

                              {/* 2. Precision Scale Notches at 2.5, 5.0, 7.5 / 10 with mini numbers */}
                              {[2.5, 5.0, 7.5].map((v) => {
                                const t = v / 10;
                                const nx = cRelX + t * (tipRelX - cRelX);
                                const ny = cRelY + t * (tipRelY - cRelY);
                                return (
                                  <g key={`notch-${v}`}>
                                    <line
                                      x1={nx - uy * 4}
                                      y1={ny + ux * 4}
                                      x2={nx + uy * 4}
                                      y2={ny - ux * 4}
                                      stroke="var(--wood-selection)"
                                      strokeWidth={1.5}
                                      strokeOpacity={0.7}
                                    />
                                    <text
                                      x={nx + uy * 8}
                                      y={ny - ux * 8}
                                      textAnchor="middle"
                                      dominantBaseline="central"
                                      fontSize="7.5"
                                      fontWeight="bold"
                                      fill="var(--sepia-muted)"
                                      opacity={0.75}
                                      className="select-none font-mono"
                                    >
                                      {v}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* 3. Individual Clean Flavor Beads on the active measuring line */}
                              {clusteredBeads.map((cluster, cIdx) => {
                                const t = Math.min(Math.max(cluster.intensity / 10, 0.08), 0.95);
                                const bx = cRelX + t * (tipRelX - cRelX);
                                const by = cRelY + t * (tipRelY - cRelY);

                                const hasNose = cluster.notes.some((n) => n.sensoryType === 'nose');
                                const hasTaste = cluster.notes.some((n) => n.sensoryType === 'taste');
                                const beadColor = hasNose && hasTaste ? 'var(--brass-accent)' : hasNose ? 'var(--sensory-nose)' : 'var(--sensory-taste)';

                                const isSideLeft = cIdx % 2 === 0;
                                const badgeOffsetDist = 18;
                                const badgeX = bx + (isSideLeft ? -uy : uy) * badgeOffsetDist;
                                const badgeY = by + (isSideLeft ? ux : -ux) * badgeOffsetDist;

                                return (
                                  <g key={`cluster-${cIdx}`} className="drop-shadow-md">
                                    {/* Hairline to circular score pill */}
                                    <line
                                      x1={bx}
                                      y1={by}
                                      x2={badgeX}
                                      y2={badgeY}
                                      stroke={beadColor}
                                      strokeWidth={1.2}
                                      strokeOpacity={0.75}
                                      strokeDasharray="2,2"
                                    />

                                    {/* Glowing Flavor Bead Node ON the line */}
                                    <circle
                                      cx={bx}
                                      cy={by}
                                      r={5.5}
                                      fill={beadColor}
                                      stroke="#FFFFFF"
                                      strokeWidth={2}
                                      className="drop-shadow-sm"
                                    />

                                    {/* Compact Circular / Rounded Score Badge beside the bead */}
                                    <g transform={`translate(${badgeX},${badgeY})`}>
                                      <circle
                                        cx={0}
                                        cy={0}
                                        r={9}
                                        fill="var(--pub-bg-panel)"
                                        stroke={beadColor}
                                        strokeWidth={1.5}
                                      />
                                      <text
                                        x={0}
                                        y={0.5}
                                        textAnchor="middle"
                                        dominantBaseline="central"
                                        fontSize="9"
                                        fontWeight="900"
                                        fontFamily="'Inter', system-ui, sans-serif"
                                        fill="var(--foreground)"
                                        className="select-none tabular-nums"
                                      >
                                        {cluster.intensity}
                                      </text>
                                    </g>
                                  </g>
                                );
                              })}
                            </g>
                          )}

                          {/* Mobile: Pure Category Emoji (Borderless & Enlarged) */}
                          <g className="sm:hidden">
                            <text
                              x={0}
                              y={4}
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize={isSelected ? '24' : isActive ? '20' : '16'}
                              opacity={isSelected ? 1 : activeNode ? 0.15 : isActive ? 0.95 : 0.35}
                              className="select-none transition-all duration-200"
                            >
                              {item?.emoji}
                            </text>
                          </g>

                          {/* Tablet & Desktop (>= sm): Crisp Typography Label */}
                          <text
                            x={0}
                            y={0}
                            textAnchor={anchor}
                            dominantBaseline={baseline}
                            fill={isSelected ? 'var(--wood-selection)' : isActive ? 'var(--foreground)' : 'var(--sepia-muted)'}
                            opacity={isSelected ? 1 : activeNode ? 0.15 : isActive ? 1 : 0.35}
                            fontSize={isSelected ? '13' : isActive ? '12' : '10.5'}
                            fontFamily="'Inter', system-ui, sans-serif"
                            fontWeight={isSelected ? '900' : isActive ? '800' : '500'}
                            className="hidden sm:block select-none transition-all duration-200"
                          >
                            {displayVal}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 10]}
                    tick={false}
                    axisLine={false}
                  />

                  {(sensoryMode === 'both' || sensoryMode === 'nose') && (
                    <Radar
                      name={noseLegend}
                      dataKey="Nose"
                      stroke="var(--sensory-nose)"
                      fill="url(#radarNoseGrad)"
                      fillOpacity={activeNode ? 0.08 : 0.85}
                      shape={<ActiveSensoryShape activeCategoryId={activeNode?.categoryId} sensoryType="nose" />}
                      isAnimationActive={false}
                    />
                  )}

                  {(sensoryMode === 'both' || sensoryMode === 'taste') && (
                    <Radar
                      name={tasteLegend}
                      dataKey="Taste"
                      stroke="var(--sensory-taste)"
                      fill="url(#radarTasteGrad)"
                      fillOpacity={activeNode ? 0.08 : 0.85}
                      shape={<ActiveSensoryShape activeCategoryId={activeNode?.categoryId} sensoryType="taste" />}
                      isAnimationActive={false}
                    />
                  )}

                  {/* ─── Center Astrolabe Medallion ─── */}
                  <Customized
                    component={({ cx, cy }: { cx?: number; cy?: number }) => {
                      if (typeof cx !== 'number' || typeof cy !== 'number') return null;
                      return (
                        <g className="pointer-events-none select-none transition-all duration-300">
                          {/* Outer subtle brass ring */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={24}
                            fill="none"
                            stroke="var(--brass-accent)"
                            strokeWidth={1}
                            strokeDasharray="2,2"
                            opacity={0.5}
                          />
                          {/* Center Parchment Medallion */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={18}
                            fill="url(#radarHubGrad)"
                            stroke="var(--parchment-border)"
                            strokeWidth={1.6}
                            className="drop-shadow-sm"
                          />
                          {/* Compass Crosshairs */}
                          <line
                            x1={cx - 9}
                            y1={cy}
                            x2={cx + 9}
                            y2={cy}
                            stroke="var(--brass-accent)"
                            strokeWidth={1}
                            opacity={0.7}
                          />
                          <line
                            x1={cx}
                            y1={cy - 9}
                            x2={cx}
                            y2={cy + 9}
                            stroke="var(--brass-accent)"
                            strokeWidth={1}
                            opacity={0.7}
                          />
                          {/* Center Brass Jewel Dot */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={2.8}
                            fill="var(--brass-accent)"
                            stroke="var(--parchment-bg)"
                            strokeWidth={0.8}
                          />
                        </g>
                      );
                    }}
                  />



                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;

                      return (
                        <div className="bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-md p-3 shadow-lg text-xs font-body text-[var(--sepia-text)] max-w-[260px]">
                          <div className="flex items-center gap-1.5 border-b border-[var(--parchment-border)]/60 pb-1.5 mb-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: data.color }} />
                            <p className="font-display font-bold uppercase tracking-wider text-[var(--sepia-text)] text-xs">
                              {data.dimension}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {(sensoryMode === 'both' || sensoryMode === 'nose') && (
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between font-semibold">
                                  <span className="text-[var(--sepia-light)]">{noseLegend}:</span>
                                  <span className="font-black text-[var(--sensory-nose)]">{data.Nose} / 10</span>
                                </div>
                                {data.activeNoseTags.length > 0 && (
                                  <p className="text-[11px] text-[var(--sepia-text)] italic leading-tight pl-2 border-l border-[var(--sensory-nose)]/40">
                                    {data.activeNoseTags.map((tag: string) => translateFlavorTag(tag, language)).join(', ')}
                                  </p>
                                )}
                              </div>
                            )}

                            {(sensoryMode === 'both' || sensoryMode === 'taste') && (
                              <div className="flex flex-col gap-0.5 border-t border-[var(--parchment-border)]/40 pt-1.5">
                                <div className="flex items-center justify-between font-semibold">
                                  <span className="text-[var(--sepia-light)]">{tasteLegend}:</span>
                                  <span className="font-black text-[var(--sensory-taste)]">{data.Taste} / 10</span>
                                </div>
                                {data.activeTasteTags.length > 0 && (
                                  <p className="text-[11px] text-[var(--sepia-text)] italic leading-tight pl-2 border-l border-[var(--sensory-taste)]/40">
                                    {data.activeTasteTags.map((tag: string) => translateFlavorTag(tag, language)).join(', ')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* ─── Level 2 & 3: Shared Interactive Category Legend and Sommelier Inspector ─── */}
            <SommelierCategoryLegendAndInspector
              activeCategoriesData={activeCategoriesData}
              activeNode={activeNode}
              pinnedNode={pinnedNode}
              language={language}
              togglePin={togglePin}
              setHoveredNode={setHoveredNode}
              clearSelection={clearSelection}
              onSelectTag={onSelectTag}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Component 2: Category-Grouped Dynamic Profile Sliders for Active Tags ─────

export function DynamicProfileSliders({
  title,
  type,
  activeTags,
  tagIntensities,
  onIntensityChange,
  className,
}: DynamicProfileSlidersProps) {
  const { language } = useLanguage();
  const isNose = type === 'nose';
  const accentClass = isNose ? 'accent-[var(--sensory-nose)]' : 'accent-[var(--sensory-taste)]';
  const valueColorClass = isNose ? 'text-[var(--sensory-nose)] font-black' : 'text-[var(--sensory-taste)] font-black';

  if (activeTags.length === 0) {
    return (
      <div className={cn('flex flex-col gap-2 w-full', className)}>
        <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1">
          <SectionHeader>{title}</SectionHeader>
        </div>
        <p className="text-xs text-[var(--sepia-light)] italic py-3 text-center border border-dashed border-[var(--parchment-border)]/40 rounded-sm">
          {language === 'DE'
            ? `Wähle oben Aromen für ${isNose ? 'Nase' : 'Geschmack'} aus, um Intensitäts-Regler hinzuzufügen.`
            : `Select flavor tags under ${isNose ? 'Nose' : 'Taste'} above to add intensity sliders.`}
        </p>
      </div>
    );
  }

  // Group active tags by taxonomy category
  const categoriesWithTags: {
    category: (typeof SPIRIT_FLAVOR_TAXONOMY)[number];
    tags: string[];
  }[] = [];

  SPIRIT_FLAVOR_TAXONOMY.forEach((cat) => {
    const tagsInCat = activeTags.filter((tagName) => {
      const catForTag = getCategoryByDescriptorId(tagName);
      return catForTag?.id === cat.id;
    });

    if (tagsInCat.length > 0) {
      categoriesWithTags.push({ category: cat, tags: tagsInCat });
    }
  });

  // Collect any custom or uncategorized tags
  const categorizedTagSet = new Set(categoriesWithTags.flatMap((c) => c.tags));
  const uncategorizedTags = activeTags.filter((t) => !categorizedTagSet.has(t));

  return (
    <div className={cn('flex flex-col gap-3 w-full', className)}>
      <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1">
        <SectionHeader>
          {title} ({activeTags.length})
        </SectionHeader>
        <span className="text-xs text-[var(--sepia-light)] font-body italic">
          {language === 'DE' ? 'Skala 0–10' : '0–10 Scale'}
        </span>
      </div>

      <div className="flex flex-col gap-3.5">
        {categoriesWithTags.map(({ category, tags }) => {
          return (
            <div
              key={category.id}
              className="flex flex-col gap-2 bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-lg p-2.5 sm:p-3 shadow-2xs"
            >
              {/* Category Sub-Header */}
              <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1 px-0.5">
                <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--sepia-text)]">
                  {category.name[language]}
                </span>
                <span className="text-[11px] font-bold text-[var(--sepia-muted)]">
                  {tags.length} {tags.length === 1 ? (language === 'DE' ? 'Aroma' : 'Note') : (language === 'DE' ? 'Aromen' : 'Notes')}
                </span>
              </div>

              {/* Individual Tag Sliders */}
              <div className="flex flex-col gap-1.5">
                {tags.map((tagName) => {
                  const val = tagIntensities[tagName] ?? 5;
                  const displayTagName = translateFlavorTag(tagName, language);

                  return (
                    <div
                      key={tagName}
                      className="grid grid-cols-[90px_1fr_24px] sm:grid-cols-[130px_1fr_28px] items-center gap-2 sm:gap-3 bg-[var(--parchment-bg)] px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-md border border-[var(--parchment-border)]/50"
                    >
                      <span
                        className="font-body text-xs sm:text-[13px] font-bold text-[var(--sepia-text)] truncate"
                        title={displayTagName}
                      >
                        {displayTagName}
                      </span>
                      <input
                        type="range"
                        min={0}
                        max={10}
                        step={1}
                        value={val}
                        onChange={(e) => onIntensityChange(tagName, Number(e.target.value))}
                        className={cn('h-2 rounded-full cursor-pointer w-full touch-none bg-[var(--parchment-border)]/60 accent-[var(--wood-selection)]', accentClass)}
                        aria-label={`${title} ${tagName}`}
                      />
                      <span className={cn('text-right text-xs sm:text-sm font-bold', valueColorClass)}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Fallback group for custom tags */}
        {uncategorizedTags.length > 0 && (
          <div className="flex flex-col gap-2 bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-lg p-2.5 sm:p-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1 px-0.5">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-[var(--sepia-text)]">
                {language === 'DE' ? 'Weitere Aromen' : 'Additional Notes'}
              </span>
              <span className="text-[11px] font-bold text-[var(--sepia-muted)]">
                {uncategorizedTags.length}
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              {uncategorizedTags.map((tagName) => {
                const val = tagIntensities[tagName] ?? 5;
                const displayTagName = translateFlavorTag(tagName, language);

                return (
                  <div
                    key={tagName}
                    className="grid grid-cols-[90px_1fr_24px] sm:grid-cols-[130px_1fr_28px] items-center gap-2 sm:gap-3 bg-[var(--parchment-bg)] px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-md border border-[var(--parchment-border)]/50"
                  >
                    <span
                      className="font-body text-xs sm:text-[13px] font-bold text-[var(--sepia-text)] truncate"
                      title={displayTagName}
                    >
                      {displayTagName}
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={val}
                      onChange={(e) => onIntensityChange(tagName, Number(e.target.value))}
                      className={cn('h-2 rounded-full cursor-pointer w-full touch-none bg-[var(--parchment-border)]/60 accent-[var(--wood-selection)]', accentClass)}
                      aria-label={`${title} ${tagName}`}
                    />
                    <span className={cn('text-right text-xs sm:text-sm font-bold', valueColorClass)}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// SingleProfileSliders retained for backward compatibility
export function SingleProfileSliders({
  title,
  profile,
  type,
  onChange,
  className,
}: SingleProfileSlidersProps) {
  const { language } = useLanguage();
  const isNose = type === 'nose';
  const accentClass = isNose ? 'accent-[var(--sensory-nose)]' : 'accent-[var(--sensory-taste)]';
  const valueColorClass = isNose ? 'text-[var(--sensory-nose)] font-bold' : 'text-[var(--sensory-taste)] font-bold';

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      <div className="flex items-center justify-between border-b border-[var(--parchment-border)]/50 pb-1">
        <span className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-[var(--sepia-light)] font-body">
          {title}
        </span>
        <span className="text-xs text-[var(--sepia-light)] font-body italic">0-10 Scale</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {CANONICAL_RADAR_CATEGORIES.map(({ key, labelEn, labelDe }) => {
          const val = profile[key];
          const translatedLabel = language === 'DE' ? labelDe : labelEn;

          return (
            <div
              key={key}
              className="grid grid-cols-[95px_1fr_24px] items-center gap-2.5"
            >
              <span className="font-body text-xs sm:text-sm font-bold text-[var(--sepia-text)] truncate">
                {translatedLabel}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={val}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className={cn('h-1.5 cursor-pointer', accentClass)}
                aria-label={`${title} ${translatedLabel}`}
              />
              <span className={cn('text-right text-xs sm:text-sm font-bold', valueColorClass)}>
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
