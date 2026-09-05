'use client';

import React, { useState, useMemo } from 'react';
import { PieChart } from 'lucide-react';
import {
  SPIRIT_FLAVOR_TAXONOMY,
  FlavorCategory,
  FlavorSubcategory,
  FlavorDescriptor,
} from '@/data/spirit-flavor-taxonomy';
import { isTagSelected } from '@/components/features/flavor-tags/FlavorTagSelector';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export type SensoryFilterMode = 'both' | 'nose' | 'taste';

interface WhiskyAromaWheelProps {
  noseFlavorTags?: string[];
  tasteFlavorTags?: string[];
  noseTagIntensities?: Record<string, number>;
  tasteTagIntensities?: Record<string, number>;
  sensoryMode?: SensoryFilterMode;
  onSelectTag?: (tagName: string) => void;
  pinnedNode?: HoveredAromaNode | null;
  hoveredNode?: HoveredAromaNode | null;
  onTogglePin?: (node: HoveredAromaNode, e?: React.MouseEvent) => void;
  onHoverNode?: (node: HoveredAromaNode | null) => void;
  onClearSelection?: () => void;
  className?: string;
}

export interface HoveredAromaNode {
  type: 'category' | 'subcategory' | 'descriptor';
  categoryId: string;
  categoryName: string;
  categoryEmoji: string;
  subcategoryName?: string;
  tagName?: string;
  score?: number;
  tagCount?: number;
  color?: string;
}

export const CATEGORY_SHORT_NAMES: Record<string, { EN: string; DE: string }> = {
  fruchtig:            { EN: 'Fruit', DE: 'Frucht' },
  frisch_fruchtig:     { EN: 'Fruit', DE: 'Frucht' },
  fruity:              { EN: 'Fruit', DE: 'Frucht' },
  weinartig:           { EN: 'Wine', DE: 'Wein' },
  getrocknet_wein:     { EN: 'Wine', DE: 'Wein' },
  winey:               { EN: 'Wine', DE: 'Wein' },
  suesse:              { EN: 'Sweet & Pastry', DE: 'Süße & Gebäck' },
  suess_getreide:      { EN: 'Sweet & Pastry', DE: 'Süße & Gebäck' },
  sweetness:           { EN: 'Sweet & Pastry', DE: 'Süße & Gebäck' },
  cereal:              { EN: 'Sweet & Pastry', DE: 'Süße & Gebäck' },
  holzig:              { EN: 'Wood & Cask', DE: 'Holz & Fass' },
  holz_nuss:           { EN: 'Wood & Cask', DE: 'Holz & Fass' },
  woody:               { EN: 'Wood & Cask', DE: 'Holz & Fass' },
  wuerzig:             { EN: 'Spices', DE: 'Würze' },
  spicy:               { EN: 'Spices', DE: 'Würze' },
  floral_herbal:       { EN: 'Herbal & Green', DE: 'Kräuter & Gras' },
  pflanzlich:          { EN: 'Herbal & Green', DE: 'Kräuter & Gras' },
  floral:              { EN: 'Herbal & Green', DE: 'Kräuter & Gras' },
  mineralisch_maritim: { EN: 'Maritime', DE: 'Maritim' },
  maritim:             { EN: 'Maritime', DE: 'Maritim' },
  sulphury:            { EN: 'Maritime', DE: 'Maritim' },
  torf:                { EN: 'Peat & Smoke', DE: 'Torf & Rauch' },
  peat:                { EN: 'Peat & Smoke', DE: 'Torf & Rauch' },
  peaty:               { EN: 'Peat & Smoke', DE: 'Torf & Rauch' },
  feinty:              { EN: 'Leather & Feinty', DE: 'Leder & Fleisch' },
};

// Polar coordinate math helpers
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  rInner: number,
  rOuter: number,
  startAngle: number,
  endAngle: number,
  padAngle: number = 0
): string {
  const span = endAngle - startAngle;
  const safePad = span > 0 ? Math.min(padAngle, span * 0.45) : 0;
  const s = startAngle + safePad / 2;
  const e = endAngle - safePad / 2;

  // Safe non-zero arc
  const safeEnd = e - s >= 360 ? s + 359.99 : e;
  if (safeEnd <= s) return '';

  const p1 = polarToCartesian(cx, cy, rOuter, s);
  const p2 = polarToCartesian(cx, cy, rOuter, safeEnd);
  const p3 = polarToCartesian(cx, cy, rInner, safeEnd);
  const p4 = polarToCartesian(cx, cy, rInner, s);
  const largeArcFlag = safeEnd - s <= 180 ? '0' : '1';

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArcFlag} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArcFlag} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ');
}

// Distinct, authentic distillery colors for all 9 categories (Rich sommelier palette with depth)
export const CATEGORY_WHEEL_COLORS: Record<
  string,
  { base: string; light: string; dark: string; stroke: string; glow: string }
> = {
  // 1. Torf & Peat (Smoldering Peat Ember & Islay Smoke)
  torf:                { base: '#DC2626', light: '#F87171', dark: '#991B1B', stroke: '#7F1D1D', glow: 'rgba(220, 38, 38, 0.4)' },
  peat:                { base: '#DC2626', light: '#F87171', dark: '#991B1B', stroke: '#7F1D1D', glow: 'rgba(220, 38, 38, 0.4)' },
  peaty:               { base: '#DC2626', light: '#F87171', dark: '#991B1B', stroke: '#7F1D1D', glow: 'rgba(220, 38, 38, 0.4)' },

  // 2. Feinty & Leather (Old Book Leather, Saddle & Beeswax)
  feinty:              { base: '#B45309', light: '#F59E0B', dark: '#78350F', stroke: '#713F12', glow: 'rgba(180, 83, 9, 0.4)' },

  // 3. Maritime & Sea (Atlantic Ocean Coastal Salinity)
  maritim:             { base: '#0284C7', light: '#38BDF8', dark: '#0369A1', stroke: '#075985', glow: 'rgba(2, 132, 199, 0.4)' },
  mineralisch_maritim: { base: '#0284C7', light: '#38BDF8', dark: '#0369A1', stroke: '#075985', glow: 'rgba(2, 132, 199, 0.4)' },
  sulphury:            { base: '#0284C7', light: '#38BDF8', dark: '#0369A1', stroke: '#075985', glow: 'rgba(2, 132, 199, 0.4)' },

  // 4. Herbal & Green (Wild Meadow Herbs, Mint & Fresh Grass)
  pflanzlich:          { base: '#16A34A', light: '#4ADE80', dark: '#15803D', stroke: '#14532D', glow: 'rgba(22, 163, 74, 0.4)' },
  floral_herbal:       { base: '#16A34A', light: '#4ADE80', dark: '#15803D', stroke: '#14532D', glow: 'rgba(22, 163, 74, 0.4)' },
  floral:              { base: '#16A34A', light: '#4ADE80', dark: '#15803D', stroke: '#14532D', glow: 'rgba(22, 163, 74, 0.4)' },

  // 5. Spices (Warm Saffron, Cinnamon & Black Pepper)
  wuerzig:             { base: '#EA580C', light: '#FB923C', dark: '#C2410C', stroke: '#9A3412', glow: 'rgba(234, 88, 12, 0.4)' },
  spicy:               { base: '#EA580C', light: '#FB923C', dark: '#C2410C', stroke: '#9A3412', glow: 'rgba(234, 88, 12, 0.4)' },

  // 6. Woody & Oak (Toasted American White Oak & Cask Char)
  holzig:              { base: '#854D0E', light: '#D97706', dark: '#5C330A', stroke: '#451A03', glow: 'rgba(133, 77, 14, 0.4)' },
  holz_nuss:           { base: '#854D0E', light: '#D97706', dark: '#5C330A', stroke: '#451A03', glow: 'rgba(133, 77, 14, 0.4)' },
  woody:               { base: '#854D0E', light: '#D97706', dark: '#5C330A', stroke: '#451A03', glow: 'rgba(133, 77, 14, 0.4)' },

  // 7. Fruity & Citrus (Ripe Orchard Fruit, Citrus Peel & Berries)
  fruchtig:            { base: '#E11D48', light: '#FB7185', dark: '#9F1239', stroke: '#881337', glow: 'rgba(225, 29, 72, 0.4)' },
  frisch_fruchtig:     { base: '#E11D48', light: '#FB7185', dark: '#9F1239', stroke: '#881337', glow: 'rgba(225, 29, 72, 0.4)' },
  fruity:              { base: '#E11D48', light: '#FB7185', dark: '#9F1239', stroke: '#881337', glow: 'rgba(225, 29, 72, 0.4)' },

  // 8. Wine & Sherry (Oloroso Sherry, Port & Dried Raisins)
  weinartig:           { base: '#881337', light: '#C026D3', dark: '#4C0519', stroke: '#350411', glow: 'rgba(136, 19, 55, 0.4)' },
  getrocknet_wein:     { base: '#881337', light: '#C026D3', dark: '#4C0519', stroke: '#350411', glow: 'rgba(136, 19, 55, 0.4)' },
  winey:               { base: '#881337', light: '#C026D3', dark: '#4C0519', stroke: '#350411', glow: 'rgba(136, 19, 55, 0.4)' },

  // 9. Sweetness & Bakery (Golden Malt, Scottish Shortbread & Honey)
  suesse:              { base: '#D97706', light: '#FBBF24', dark: '#92400E', stroke: '#78350F', glow: 'rgba(217, 119, 6, 0.4)' },
  suess_getreide:      { base: '#D97706', light: '#FBBF24', dark: '#92400E', stroke: '#78350F', glow: 'rgba(217, 119, 6, 0.4)' },
  sweetness:           { base: '#D97706', light: '#FBBF24', dark: '#92400E', stroke: '#78350F', glow: 'rgba(217, 119, 6, 0.4)' },
  cereal:              { base: '#D97706', light: '#FBBF24', dark: '#92400E', stroke: '#78350F', glow: 'rgba(217, 119, 6, 0.4)' },
};

export interface ActiveCategoryData {
  category: FlavorCategory;
  activeDescriptors: {
    descriptor: FlavorDescriptor;
    subcategory: FlavorSubcategory;
    intensity: number;
  }[];
  subcategories: {
    subcategory: FlavorSubcategory;
    activeDescriptors: {
      descriptor: FlavorDescriptor;
      subcategory: FlavorSubcategory;
      intensity: number;
    }[];
  }[];
}

export function computeActiveCategoriesData(
  activeTags: string[],
  tagIntensities: Record<string, number>
): ActiveCategoryData[] {
  return SPIRIT_FLAVOR_TAXONOMY.map((cat) => {
    const activeDescriptorsInCat: {
      descriptor: FlavorDescriptor;
      subcategory: FlavorSubcategory;
      intensity: number;
    }[] = [];

    const activeSubcats: {
      subcategory: FlavorSubcategory;
      activeDescriptors: {
        descriptor: FlavorDescriptor;
        subcategory: FlavorSubcategory;
        intensity: number;
      }[];
    }[] = [];

    cat.subcategories.forEach((sub) => {
      const activeInSub: {
        descriptor: FlavorDescriptor;
        subcategory: FlavorSubcategory;
        intensity: number;
      }[] = [];

      sub.descriptors.forEach((desc) => {
        if (isTagSelected(desc, activeTags)) {
          const tagName = desc.name.EN;
          const deName = desc.name.DE;
          const matchedTag = activeTags.find(
            (t) =>
              t.toLowerCase() === desc.id.toLowerCase() ||
              t.toLowerCase() === desc.name.EN.toLowerCase() ||
              t.toLowerCase() === desc.name.DE.toLowerCase() ||
              (desc.aliases && desc.aliases.some((a) => a.toLowerCase() === t.toLowerCase()))
          );

          const intensity =
            (matchedTag ? tagIntensities[matchedTag] : undefined) ??
            tagIntensities[tagName] ??
            tagIntensities[deName] ??
            tagIntensities[desc.id] ??
            5;

          const item = {
            descriptor: desc,
            subcategory: sub,
            intensity,
          };
          activeDescriptorsInCat.push(item);
          activeInSub.push(item);
        }
      });

      if (activeInSub.length > 0) {
        activeSubcats.push({
          subcategory: sub,
          activeDescriptors: activeInSub,
        });
      }
    });

    return {
      category: cat,
      activeDescriptors: activeDescriptorsInCat,
      subcategories: activeSubcats,
    };
  }).filter((item) => item.activeDescriptors.length > 0);
}

export interface SommelierCategoryLegendProps {
  activeCategoriesData: ActiveCategoryData[];
  activeNode: HoveredAromaNode | null;
  pinnedNode: HoveredAromaNode | null;
  language: 'DE' | 'EN';
  togglePin: (node: HoveredAromaNode, e?: React.MouseEvent) => void;
  setHoveredNode: (node: HoveredAromaNode | null) => void;
  clearSelection: () => void;
  onSelectTag?: (tagName: string) => void;
  className?: string;
}

export function SommelierCategoryLegendAndInspector({
  activeCategoriesData,
  activeNode,
  pinnedNode,
  language,
  togglePin,
  setHoveredNode,
  clearSelection,
  onSelectTag,
  className,
}: SommelierCategoryLegendProps) {
  if (activeCategoriesData.length === 0) return null;

  return (
    <div className={cn('w-full flex flex-col gap-2.5 select-none', className)}>
      {/* ─── Level 2: Category Cards Grid (2-3 Columns Legend & Filter) ─── */}
      <div
        className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm font-body font-semibold text-[var(--sepia-muted)]"
        onClick={(e) => e.stopPropagation()}
      >
        {activeCategoriesData.map(({ category: cat, activeDescriptors }) => {
          const colorConfig = CATEGORY_WHEEL_COLORS[cat.id] || { base: '#D97706' };
          const activeInCatCount = activeDescriptors.length;
          const isSelected = activeNode?.categoryId === cat.id;
          const maxScore = activeDescriptors.reduce((m, d) => Math.max(m, d.intensity), 0);

          const catNodeData: HoveredAromaNode = {
            type: 'category',
            categoryId: cat.id,
            categoryName: cat.name[language],
            categoryEmoji: cat.emoji,
            score: maxScore,
            tagCount: activeInCatCount,
            color: colorConfig.base,
          };

          return (
            <button
              type="button"
              key={cat.id}
              onClick={(e) => togglePin(catNodeData, e)}
              onMouseEnter={() => setHoveredNode(catNodeData)}
              onMouseLeave={() => setHoveredNode(null)}
              className={cn(
                'flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-[var(--foreground)] shadow-xs text-left transition-all duration-150 cursor-pointer min-h-[38px]',
                isSelected
                  ? 'bg-[var(--wood-selection)] text-white border-[var(--wood-selection)] ring-2 ring-[var(--wood-selection)]/35 scale-[1.02] shadow-sm font-bold'
                  : 'bg-[var(--pub-bg-panel)] border-[var(--parchment-border)] hover:border-[var(--sepia-muted)] hover:bg-[var(--pub-bg-alt)]'
              )}
              title={cat.name[language]}
            >
              <div className="flex items-center gap-2 min-w-0 truncate">
                <span className="text-sm sm:text-base shrink-0 select-none">{cat.emoji}</span>
                <span className="truncate text-xs sm:text-sm font-semibold">{cat.name[language]}</span>
              </div>
              <span
                className={cn(
                  'ml-auto text-xs font-mono font-bold px-2 py-0.5 rounded-full shrink-0',
                  isSelected
                    ? 'bg-black/25 text-white'
                    : 'bg-[var(--parchment-border)]/60 text-[var(--sepia-text)]'
                )}
              >
                {activeInCatCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* ─── Level 3: Sommelier Inspector & Aroma Notes Breakdown (Drill-Down Details) ─── */}
      <div
        className="w-full flex flex-col p-2.5 rounded-lg border bg-[var(--pub-bg-panel)] border-[var(--parchment-border)] shadow-xs transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {activeNode ? (
          <div className="flex flex-col gap-2 w-full">
            {/* Header: Breadcrumb (Category › Subcategory) */}
            <div className="flex items-center justify-between w-full gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-base shrink-0 select-none">{activeNode.categoryEmoji}</span>
                <span className="font-bold text-xs text-[var(--foreground)] truncate">{activeNode.categoryName}</span>
                {activeNode.subcategoryName && (
                  <>
                    <span className="text-[var(--sepia-muted)]/70 text-[10px]">›</span>
                    <span className="text-[var(--sepia-muted)] text-xs truncate">{activeNode.subcategoryName}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-bold text-[var(--sepia-muted)]">
                  {activeNode.tagCount ?? activeCategoriesData.find((c) => c.category.id === activeNode.categoryId)?.activeDescriptors.length ?? 0}{' '}
                  {language === 'DE' ? 'Noten' : 'Notes'}
                </span>

                {pinnedNode && (
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[var(--sepia-muted)] hover:text-[var(--foreground)] hover:bg-[var(--parchment-border)]/50 text-xs transition-all cursor-pointer"
                    title={language === 'DE' ? 'Auswahl aufheben' : 'Clear selection'}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Active Aroma Tags (2-3 Columns Masonry / Grid) */}
            {(() => {
              const catData = activeCategoriesData.find((c) => c.category.id === activeNode.categoryId);
              if (!catData || catData.activeDescriptors.length === 0) return null;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-2 border-t border-[var(--parchment-border)]/60">
                  {catData.activeDescriptors.map((d) => {
                    const descName = d.descriptor.name[language] ?? d.descriptor.name.EN;
                    const isSelected = activeNode.tagName === descName;

                    return (
                      <button
                        key={d.descriptor.id}
                        type="button"
                        onClick={(e) => {
                          togglePin(
                            {
                              type: 'descriptor',
                              categoryId: catData.category.id,
                              categoryName: catData.category.name[language],
                              categoryEmoji: catData.category.emoji,
                              subcategoryName: d.subcategory.name[language],
                              tagName: descName,
                              score: d.intensity,
                              color: CATEGORY_WHEEL_COLORS[catData.category.id]?.base || '#D97706',
                            },
                            e
                          );
                          onSelectTag?.(d.descriptor.name.EN);
                        }}
                        className={cn(
                          'flex items-center justify-between gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-[13px] font-body font-semibold transition-all cursor-pointer shadow-2xs min-w-0 text-left min-h-[32px]',
                          isSelected
                            ? 'bg-[var(--wood-selection)] text-white font-bold ring-2 ring-[var(--wood-selection)]/35 scale-[1.02] shadow-xs'
                            : 'bg-[var(--parchment-bg)] text-[var(--foreground)] border border-[var(--parchment-border)] hover:border-[var(--sepia-muted)] hover:bg-[var(--pub-bg-alt)]'
                        )}
                        title={descName}
                      >
                        <span className="truncate">{descName}</span>
                        <span
                          className={cn(
                            'text-[10px] font-mono font-bold shrink-0 ml-auto pl-1',
                            isSelected ? 'text-white/90' : 'text-[var(--sepia-muted)]'
                          )}
                        >
                          {d.intensity}/10
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-[var(--sepia-muted)] font-display italic py-0.5">
            <span>💡</span>
            <span>
              {language === 'DE'
                ? 'Tippe oder fahre über ein Segment oder eine Kategorie, um alle Details zu sehen.'
                : 'Tap or hover over any segment or category to inspect its details.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function WhiskyAromaWheel({
  noseFlavorTags = [],
  tasteFlavorTags = [],
  noseTagIntensities = {},
  tasteTagIntensities = {},
  sensoryMode = 'both',
  onSelectTag,
  pinnedNode: externalPinnedNode,
  hoveredNode: externalHoveredNode,
  onTogglePin: externalTogglePin,
  onHoverNode: externalHoverNode,
  onClearSelection: externalClearSelection,
  className,
}: WhiskyAromaWheelProps) {
  const { language } = useLanguage();
  const [internalPinnedNode, setInternalPinnedNode] = useState<HoveredAromaNode | null>(null);
  const [internalHoveredNode, setInternalHoveredNode] = useState<HoveredAromaNode | null>(null);

  const pinnedNode = externalPinnedNode !== undefined ? externalPinnedNode : internalPinnedNode;
  const hoveredNode = externalHoveredNode !== undefined ? externalHoveredNode : internalHoveredNode;
  const setHoveredNode = externalHoverNode || setInternalHoveredNode;

  const activeNode = hoveredNode || pinnedNode;

  const togglePin = (node: HoveredAromaNode, e?: React.MouseEvent) => {
    if (externalTogglePin) {
      externalTogglePin(node, e);
      return;
    }
    e?.stopPropagation();
    setInternalPinnedNode((prev) => {
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
    if (externalClearSelection) {
      externalClearSelection();
      return;
    }
    setInternalPinnedNode(null);
    setInternalHoveredNode(null);
  };

  // Filter active tags according to active sensory filter mode
  const activeTags = useMemo(() => {
    if (sensoryMode === 'nose') return noseFlavorTags;
    if (sensoryMode === 'taste') return tasteFlavorTags;
    return Array.from(new Set([...noseFlavorTags, ...tasteFlavorTags]));
  }, [sensoryMode, noseFlavorTags, tasteFlavorTags]);

  const tagIntensities = useMemo(() => {
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

  const cx = 220;
  const cy = 220;
  const rCenter = 42;
  const rInnerStart = 47;
  const rInnerEnd = 95;
  const rMidStart = 99;
  const rMidEnd = 145;
  const rOuterBase = 149;
  const rOuterMax = 212;
  const rMidGuide = 180.5; // 5/10 intensity guide ring

  // Filter categories to only those with active flavor tags
  const activeCategoriesData = useMemo(() => {
    return computeActiveCategoriesData(activeTags, tagIntensities);
  }, [activeTags, tagIntensities]);

  // Overall summary statistics for center hub
  const totalStats = useMemo(() => {
    const scores: number[] = [];
    activeCategoriesData.forEach((c) => {
      c.activeDescriptors.forEach((d) => scores.push(d.intensity));
    });
    const count = scores.length;
    const avg = count > 0 ? (scores.reduce((a, b) => a + b, 0) / count).toFixed(1) : '0';
    return { count, avg };
  }, [activeCategoriesData]);

  // Generate dynamic 360-degree floating SVG arcs with angular padding
  const renderedSlices = useMemo(() => {
    const numActiveCats = activeCategoriesData.length;
    if (numActiveCats === 0) return [];

    const categoryAngleSpan = 360 / numActiveCats;

    return activeCategoriesData.map((catData, catIdx) => {
      const { category: cat, activeDescriptors: activeDescriptorsInCat, subcategories: subcats } = catData;
      const catStartAngle = catIdx * categoryAngleSpan;
      const catEndAngle = catStartAngle + categoryAngleSpan;
      const catColorConfig = CATEGORY_WHEEL_COLORS[cat.id] || {
        base: '#D97706',
        light: '#FBBF24',
        dark: '#92400E',
        stroke: '#78350F',
        glow: 'rgba(217, 119, 6, 0.4)',
      };

      const maxIntensityInCat = activeDescriptorsInCat.reduce((m, d) => Math.max(m, d.intensity), 0);

      // Subcategories subdivision with 1.2° padding
      const subAngleSpan = subcats.length > 0 ? categoryAngleSpan / subcats.length : categoryAngleSpan;

      const subSlices = subcats.map((subItem, subIdx) => {
        const subStart = catStartAngle + subIdx * subAngleSpan;
        const subEnd = subStart + subAngleSpan;

        return {
          subcategory: subItem.subcategory,
          activeDescriptors: subItem.activeDescriptors,
          startAngle: subStart,
          endAngle: subEnd,
          isActive: true,
          path: describeArc(cx, cy, rMidStart, rMidEnd, subStart, subEnd, 1.2),
        };
      });

      // Individual Descriptors (Petals) subdivision with 1.6° floating padding
      const itemAngleSpan =
        activeDescriptorsInCat.length > 0 ? categoryAngleSpan / activeDescriptorsInCat.length : categoryAngleSpan;

      const outerPetals = activeDescriptorsInCat.map((item, itemIdx) => {
        const itemStart = catStartAngle + itemIdx * itemAngleSpan;
        const itemEnd = itemStart + itemAngleSpan;
        const intensityRatio = Math.max(0.18, item.intensity / 10);
        const currentOuterR = rOuterBase + intensityRatio * (rOuterMax - rOuterBase);
        const midAngle = (itemStart + itemEnd) / 2;

        return {
          descriptor: item.descriptor,
          subcategory: item.subcategory,
          intensity: item.intensity,
          startAngle: itemStart,
          endAngle: itemEnd,
          itemAngleSpan,
          path: describeArc(cx, cy, rOuterBase, currentOuterR, itemStart, itemEnd, 1.6),
          tipPoint: polarToCartesian(cx, cy, currentOuterR - 2, midAngle),
          labelPoint: polarToCartesian(
            cx,
            cy,
            Math.max(rOuterBase + 13, currentOuterR - 10),
            midAngle
          ),
        };
      });

      return {
        category: cat,
        startAngle: catStartAngle,
        endAngle: catEndAngle,
        colorConfig: catColorConfig,
        maxIntensity: maxIntensityInCat,
        activeCount: activeDescriptorsInCat.length,
        innerPath: describeArc(cx, cy, rInnerStart, rInnerEnd, catStartAngle, catEndAngle, 2.0),
        midSlices: subSlices,
        outerPetals,
      };
    });
  }, [activeCategoriesData, cx, cy]);

  if (activeCategoriesData.length === 0) {
    return (
      <div className={cn('relative flex flex-col items-center justify-center select-none w-full h-[400px] sm:h-[480px] lg:h-[520px] text-center p-6 gap-3', className)}>
        <div className="w-16 h-16 rounded-full bg-[var(--pub-bg-alt)] border border-[var(--parchment-border)] flex items-center justify-center text-[var(--brass-accent)] shadow-xs">
          <PieChart size={32} className="opacity-75" />
        </div>
        <p className="font-display font-bold text-base sm:text-lg text-[var(--sepia-text)]">
          {language === 'DE' ? 'Keine Aromen ausgewählt' : 'No aromas selected'}
        </p>
        <p className="font-body text-xs sm:text-sm text-[var(--sepia-muted)] max-w-sm">
          {language === 'DE'
            ? 'Wähle Aromen unter Nase oder Geschmack aus, um dein dynamisches Aromenrad aufzubauen.'
            : 'Select aroma notes for nose or palate to dynamically build your custom aroma wheel.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn('relative flex flex-col items-center select-none w-full gap-3', className)}
      onClick={clearSelection}
    >
      {/* ─── Grand Sunburst SVG Visualizer ─── */}
      <div className="relative w-full max-w-[440px] sm:max-w-[500px] lg:max-w-[540px] aspect-square flex items-center justify-center">
        <svg
          viewBox="0 0 440 440"
          className="w-full h-full drop-shadow-[0_6px_20px_rgba(43,30,20,0.14)] transition-all duration-300"
        >
          <defs>
            {/* Center Medallion Radial Gradient */}
            <radialGradient id="hubGrad" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="var(--parchment-bg)" />
              <stop offset="75%" stopColor="var(--parchment-bg-alt)" />
              <stop offset="100%" stopColor="var(--parchment-border)" />
            </radialGradient>

            {/* Soft Ambient Radial Background for Wheel Canvas */}
            <radialGradient id="wheelBacking" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--parchment-bg-alt)" stopOpacity="0.45" />
              <stop offset="70%" stopColor="var(--parchment-bg)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>

            {/* Glow Filter for Active Elements */}
            <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="3" floodColor="rgba(201, 122, 30, 0.45)" />
            </filter>
          </defs>

          {/* Canvas Ambient Backing */}
          <circle cx={cx} cy={cy} r={rOuterMax + 4} fill="url(#wheelBacking)" />

          {/* Background Concentric Guide Tracks */}
          <circle cx={cx} cy={cy} r={rInnerEnd} fill="none" stroke="var(--parchment-border)" strokeWidth="0.75" opacity="0.35" />
          <circle cx={cx} cy={cy} r={rMidEnd} fill="none" stroke="var(--parchment-border)" strokeWidth="0.75" opacity="0.35" />
          <circle cx={cx} cy={cy} r={rMidGuide} fill="none" stroke="var(--brass-accent)" strokeWidth="0.85" strokeDasharray="3,3" opacity="0.4" />
          <circle cx={cx} cy={cy} r={rOuterMax} fill="none" stroke="var(--parchment-border)" strokeWidth="1" strokeDasharray="4,5" opacity="0.35" />

          {/* ─── Layer 1: Inner Category Ring (Floating Slices) ─── */}
          {renderedSlices.map((slice) => {
            const isCatActive = activeNode?.categoryId === slice.category.id;
            const isDimmed = activeNode !== null && !isCatActive;
            const midAngle = (slice.startAngle + slice.endAngle) / 2;
            const midR = (rInnerStart + rInnerEnd) / 2;
            const iconPos = polarToCartesian(cx, cy, midR, midAngle);

            const catNodeData: HoveredAromaNode = {
              type: 'category',
              categoryId: slice.category.id,
              categoryName: slice.category.name[language],
              categoryEmoji: slice.category.emoji,
              score: slice.maxIntensity,
              tagCount: slice.activeCount,
              color: slice.colorConfig.base,
            };

            return (
              <g
                key={slice.category.id}
                className="cursor-pointer transition-all duration-200"
                opacity={isDimmed ? 0.38 : 1}
                onClick={(e) => togglePin(catNodeData, e)}
                onMouseEnter={() => setHoveredNode(catNodeData)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <path
                  d={slice.innerPath}
                  fill={slice.colorConfig.base}
                  fillOpacity={isCatActive ? 0.98 : 0.88}
                  stroke={isCatActive ? 'var(--wood-selection)' : slice.colorConfig.stroke}
                  strokeWidth={isCatActive ? '2.5' : '1'}
                  strokeLinejoin="round"
                  filter={isCatActive ? 'url(#activeGlow)' : undefined}
                  className="transition-all duration-200 hover:brightness-115"
                />
                {/* Category Emoji Icon inside the floating slice */}
                <text
                  x={iconPos.x}
                  y={iconPos.y + 6}
                  textAnchor="middle"
                  fontSize="17"
                  className="select-none pointer-events-none drop-shadow-xs transition-transform duration-200"
                >
                  {slice.category.emoji}
                </text>
              </g>
            );
          })}

          {/* ─── Layer 2: Middle Subcategory Ring (Floating Slices) ─── */}
          {renderedSlices.map((slice) =>
            slice.midSlices.map((subSlice) => {
              const isSubActive = activeNode?.subcategoryName === subSlice.subcategory.name[language];
              const isCatActive = activeNode?.categoryId === slice.category.id;
              const isDimmed = activeNode !== null && !isCatActive;

              const subNodeData: HoveredAromaNode = {
                type: 'subcategory',
                categoryId: slice.category.id,
                categoryName: slice.category.name[language],
                categoryEmoji: slice.category.emoji,
                subcategoryName: subSlice.subcategory.name[language],
                tagCount: subSlice.activeDescriptors.length,
                color: slice.colorConfig.base,
              };

              return (
                <path
                  key={subSlice.subcategory.id}
                  d={subSlice.path}
                  fill={slice.colorConfig.light}
                  fillOpacity={isSubActive ? 0.95 : 0.76}
                  stroke={isSubActive ? 'var(--wood-selection)' : slice.colorConfig.stroke}
                  strokeWidth={isSubActive ? '2.2' : '0.8'}
                  strokeLinejoin="round"
                  opacity={isDimmed ? 0.38 : 1}
                  className="cursor-pointer transition-all duration-200 hover:brightness-115"
                  onClick={(e) => togglePin(subNodeData, e)}
                  onMouseEnter={() => setHoveredNode(subNodeData)}
                  onMouseLeave={() => setHoveredNode(null)}
                />
              );
            })
          )}

          {/* ─── Layer 3: Outer Active Aroma Descriptors (Floating Petals with Intensity) ─── */}
          {renderedSlices.map((slice) =>
            slice.outerPetals.map((petal) => {
              const desc = petal.descriptor;
              const tagName = desc.name[language] ?? desc.name.EN;
              const isPetalActive = activeNode?.tagName === tagName;
              const isCatActive = activeNode?.categoryId === slice.category.id;
              const isDimmed = activeNode !== null && !isCatActive;

              const petalNodeData: HoveredAromaNode = {
                type: 'descriptor',
                categoryId: slice.category.id,
                categoryName: slice.category.name[language],
                categoryEmoji: slice.category.emoji,
                subcategoryName: petal.subcategory.name[language],
                tagName,
                score: petal.intensity,
                tagCount: slice.activeCount,
                color: slice.colorConfig.base,
              };

              return (
                <g
                  key={desc.id}
                  className="cursor-pointer transition-all duration-200"
                  opacity={isDimmed ? 0.38 : 1}
                  onClick={(e) => {
                    togglePin(petalNodeData, e);
                    onSelectTag?.(desc.name.EN);
                  }}
                  onMouseEnter={() => setHoveredNode(petalNodeData)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <path
                    d={petal.path}
                    fill={slice.colorConfig.base}
                    fillOpacity={isPetalActive ? 1 : 0.92}
                    stroke={isPetalActive ? 'var(--wood-selection)' : slice.colorConfig.stroke}
                    strokeWidth={isPetalActive ? '2.5' : '1.2'}
                    strokeLinejoin="round"
                    filter={isPetalActive ? 'url(#activeGlow)' : undefined}
                    className="hover:brightness-125 transition-all duration-150"
                  />
                  {/* Glowing tip indicator node */}
                  <circle
                    cx={petal.tipPoint.x}
                    cy={petal.tipPoint.y}
                    r={isPetalActive ? 4.5 : 2.5}
                    fill={isPetalActive ? 'var(--brass-accent)' : '#FFFFFF'}
                    stroke={isPetalActive ? 'var(--wood-selection)' : slice.colorConfig.stroke}
                    strokeWidth={isPetalActive ? '2' : '1'}
                    className="pointer-events-none drop-shadow-xs"
                  />
                  {/* Direct Intensity Value Label on first glance (rendered if wedge has enough space >= 10°) */}
                  {petal.itemAngleSpan >= 10 && (
                    <text
                      x={petal.labelPoint.x}
                      y={petal.labelPoint.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={petal.itemAngleSpan >= 16 ? '11.5' : '9.5'}
                      fontWeight="900"
                      fontFamily="'Inter', system-ui, sans-serif"
                      fill="#FFFFFF"
                      className="pointer-events-none select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] tabular-nums"
                    >
                      {petal.intensity}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* ─── Center Hub (Luxury Embossed Tasting Medallion) ─── */}
          <circle
            cx={cx}
            cy={cy}
            r={rCenter + 2}
            fill="none"
            stroke="var(--parchment-border)"
            strokeWidth="0.8"
            opacity="0.5"
            className="pointer-events-none"
          />
          <circle
            cx={cx}
            cy={cy}
            r={rCenter}
            fill="url(#hubGrad)"
            stroke="var(--brass-accent)"
            strokeWidth="1.8"
            className="drop-shadow-md cursor-pointer transition-all duration-200 hover:brightness-105"
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
          />
          <circle
            cx={cx}
            cy={cy}
            r={rCenter - 3.5}
            fill="none"
            stroke="var(--parchment-border)"
            strokeWidth="0.8"
            strokeDasharray="3,2"
            opacity="0.6"
            className="pointer-events-none"
          />

          {/* Center Hub Content: Noble Sommelier Summary */}
          <g className="pointer-events-none">
            {activeNode ? (
              <>
                <text
                  x={cx}
                  y={cy - 6}
                  textAnchor="middle"
                  fontSize="21"
                  className="select-none drop-shadow-xs"
                >
                  {activeNode.categoryEmoji}
                </text>
                <text
                  x={cx}
                  y={cy + 14}
                  textAnchor="middle"
                  fontFamily="'Inter', system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="13.5"
                  fill={activeNode.color || 'var(--brass-accent)'}
                  className="tabular-nums select-none tracking-tight"
                >
                  {activeNode.score !== undefined ? (
                    <>
                      {activeNode.score} <tspan fontSize="9.5" fontWeight="bold" fill="var(--sepia-muted)">/ 10</tspan>
                    </>
                  ) : (
                    `${activeNode.tagCount ?? 0} ${language === 'DE' ? 'Noten' : 'Notes'}`
                  )}
                </text>
              </>
            ) : (
              <>
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontWeight="bold"
                  fontSize="9"
                  fill="var(--sepia-muted)"
                  className="tracking-widest uppercase select-none"
                >
                  {language === 'DE' ? 'Aromen' : 'Aroma'}
                </text>
                <text
                  x={cx}
                  y={cy + 5}
                  textAnchor="middle"
                  fontFamily="'Inter', system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="15.5"
                  fill="var(--brass-accent)"
                  className="tabular-nums select-none tracking-tight"
                >
                  Ø {totalStats.avg}
                </text>
                <text
                  x={cx}
                  y={cy + 19}
                  textAnchor="middle"
                  fontFamily="'Inter', system-ui, sans-serif"
                  fontWeight="bold"
                  fontSize="9.5"
                  fill="var(--sepia-text)"
                  className="tabular-nums select-none"
                >
                  {totalStats.count} {language === 'DE' ? 'Noten' : 'Notes'}
                </text>
              </>
            )}
          </g>
        </svg>
      </div>

      {/* ─── Level 2 & 3: Shared Category Legend and Sommelier Inspector ─── */}
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
  );
}
