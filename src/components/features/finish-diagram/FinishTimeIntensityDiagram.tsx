'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FinishCurveParams, RADAR_DIMENSION_COLORS } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { t, TranslationKey } from '@/lib/i18n/translations';
import { findFlavorDescriptor, translateFlavorTag } from '@/data/spirit-flavor-taxonomy';
import { cn } from '@/lib/utils';

// ─── Color Synchronization Utility ──────────────────────────────────────────

export function getFlavorColor(tagName: string): string {
  const desc = findFlavorDescriptor(tagName);
  if (desc && desc.radarDimension && RADAR_DIMENSION_COLORS[desc.radarDimension]) {
    return RADAR_DIMENSION_COLORS[desc.radarDimension];
  }
  // Deterministic fallback color based on string hash
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 65%, 45%)`;
}

// ─── Component Props ─────────────────────────────────────────────────────────

interface FinishTimeIntensityDiagramProps {
  noseFlavorTags?: string[];
  tasteFlavorTags?: string[];
  noseTagIntensities?: Record<string, number>;
  tasteTagIntensities?: Record<string, number>;
  finishCurves?: Record<string, FinishCurveParams>;
  onChangeCurves: (curves: Record<string, FinishCurveParams>) => void;
  viewMode?: 'simple' | 'advanced';
  onViewModeChange?: (mode: 'simple' | 'advanced') => void;
  selectedFinish?: string;
  onSelectFinish?: (finish: string) => void;
  className?: string;
}

// ─── Diagram Dimensions & Coordinates ────────────────────────────────────────

const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 240;
const PADDING = { top: 20, right: 30, bottom: 40, left: 45 };

const GRAPH_WIDTH = CANVAS_WIDTH - PADDING.left - PADDING.right;   // 565px
const GRAPH_HEIGHT = CANVAS_HEIGHT - PADDING.top - PADDING.bottom; // 180px

const MAX_TIME = 20; // Maximum time scale: 0 to 20 seconds
const MAX_INTENSITY = 10; // 0 to 10 scale

// Convert time (s) to SVG canvas X pixel
function timeToX(t: number): number {
  const clamped = Math.max(0, Math.min(MAX_TIME, t));
  return PADDING.left + (clamped / MAX_TIME) * GRAPH_WIDTH;
}

// Convert intensity (0-10) to SVG canvas Y pixel
function intensityToY(intensity: number): number {
  const clamped = Math.max(0, Math.min(MAX_INTENSITY, intensity));
  return PADDING.top + GRAPH_HEIGHT - (clamped / MAX_INTENSITY) * GRAPH_HEIGHT;
}

// Default curve generator for newly added tags
function getDefaultCurve(
  tagName: string,
  noseTagIntensities: Record<string, number>,
  tasteTagIntensities: Record<string, number>
): FinishCurveParams {
  const baseIntensity =
    tasteTagIntensities[tagName] ??
    noseTagIntensities[tagName] ??
    6;

  return {
    startTime: 0,
    peakTime: 3,
    peakIntensity: baseIntensity,
    endTime: 14,
  };
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function FinishTimeIntensityDiagram({
  noseFlavorTags = [],
  tasteFlavorTags = [],
  noseTagIntensities = {},
  tasteTagIntensities = {},
  finishCurves = {},
  onChangeCurves,
  viewMode = 'simple',
  onViewModeChange,
  selectedFinish,
  onSelectFinish,
  className,
}: FinishTimeIntensityDiagramProps) {
  const { language } = useLanguage();
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Combine unique active flavor tags from Nose and Taste
  const activeTags = Array.from(
    new Set([...noseFlavorTags, ...tasteFlavorTags])
  );

  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  // Synchronize curve state: ensure all active tags have curve parameters
  useEffect(() => {
    let updated = false;
    const nextCurves: Record<string, FinishCurveParams> = { ...finishCurves };

    activeTags.forEach((tag) => {
      if (!nextCurves[tag]) {
        nextCurves[tag] = getDefaultCurve(tag, noseTagIntensities, tasteTagIntensities);
        updated = true;
      }
    });

    if (updated) {
      onChangeCurves(nextCurves);
    }
  }, [activeTags, finishCurves, noseTagIntensities, tasteTagIntensities, onChangeCurves]);

  // Compute Bezier Spline Path string
  const getCurvePath = (curve: FinishCurveParams): string => {
    const xStart = timeToX(curve.startTime);
    const yStart = intensityToY(0);

    const xPeak = timeToX(curve.peakTime);
    const yPeak = intensityToY(curve.peakIntensity);

    const xEnd = timeToX(curve.endTime);
    const yEnd = intensityToY(0);

    // Smooth Bezier control points
    const cp1x = xStart + (xPeak - xStart) * 0.45;
    const cp2x = xPeak + (xEnd - xPeak) * 0.35;

    return `M ${xStart} ${yStart} C ${cp1x} ${yPeak}, ${cp1x} ${yPeak}, ${xPeak} ${yPeak} C ${cp2x} ${yPeak}, ${cp2x} ${yEnd}, ${xEnd} ${yEnd}`;
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between border-b border-[#C4A87A]/50 pb-1">
      <span className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-[#8c6440] font-body">
        {t('finishTimeIntensityDiagram', language)}
      </span>
      {onViewModeChange && (
        <div className="flex items-center p-0.5 rounded-sm bg-[#1A120B]/10 border border-[#C4A87A]/80 shrink-0">
          <button
            id="finish-mode-simple"
            type="button"
            onClick={() => onViewModeChange('simple')}
            className={cn(
              'px-3 py-1.5 text-xs font-body font-bold rounded-xs transition-all cursor-pointer',
              viewMode === 'simple'
                ? 'bg-[#C59B27] text-[#1A120B] shadow-xs'
                : 'text-[#5c3d22] hover:text-[#1A120B]'
            )}
            aria-pressed={viewMode === 'simple'}
          >
            {t('simpleMode', language)}
          </button>
          <button
            id="finish-mode-advanced"
            type="button"
            onClick={() => onViewModeChange('advanced')}
            className={cn(
              'px-3 py-1.5 text-xs font-body font-bold rounded-xs transition-all cursor-pointer',
              viewMode === 'advanced'
                ? 'bg-[#C59B27] text-[#1A120B] shadow-xs'
                : 'text-[#5c3d22] hover:text-[#1A120B]'
            )}
            aria-pressed={viewMode === 'advanced'}
          >
            {t('advancedMode', language)}
          </button>
        </div>
      )}
    </div>
  );

  const renderSimpleMode = () => (
    <div className="grid grid-cols-3 gap-2.5 py-1">
      {[
        { key: 'Short', labelKey: 'finish_Short' as TranslationKey },
        { key: 'Medium', labelKey: 'finish_Medium' as TranslationKey },
        { key: 'Long', labelKey: 'finish_Long' as TranslationKey },
      ].map(({ key, labelKey }) => (
        <button
          key={key}
          id={`finish-btn-${key.toLowerCase()}`}
          type="button"
          onClick={() => onSelectFinish?.(key)}
          className={cn(
            'px-3 py-2.5 rounded-md border text-xs sm:text-sm font-body font-semibold transition-all text-center cursor-pointer',
            selectedFinish === key
              ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] shadow-sm'
              : 'border-[#C4A87A]/60 bg-[#1A120B]/5 text-[#5c3d22] hover:bg-[#1A120B]/12'
          )}
          aria-pressed={selectedFinish === key}
        >
          {t(labelKey, language)}
        </button>
      ))}
    </div>
  );

  if (viewMode === 'simple') {
    return (
      <div className={cn('flex flex-col gap-3.5 w-full', className)}>
        {renderHeader()}
        {renderSimpleMode()}
      </div>
    );
  }

  if (activeTags.length === 0) {
    return (
      <div className={cn('flex flex-col gap-2 w-full', className)}>
        {renderHeader()}
        <div className="p-6 text-center border border-dashed border-[#C4A87A]/50 rounded-sm bg-[#1A120B]/5 flex flex-col items-center justify-center gap-2">
          <p className="text-xs sm:text-sm text-[#8c6440] font-body italic max-w-md">
            {t('noActiveFlavorTagsFinish', language)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3.5 w-full', className)}>
      {renderHeader()}

      {/* SVG Canvas (Clean Graph Display) */}
      <div className="relative w-full bg-[#1A120B]/8 border border-[#C4A87A]/60 rounded-md p-2 shadow-inner overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="w-full h-auto"
        >
          {/* Grid Lines */}
          {/* Y Grid & Axis Labels (0 to 10) */}
          {[0, 2, 4, 6, 8, 10].map((intVal) => {
            const y = intensityToY(intVal);
            return (
              <g key={`y-grid-${intVal}`}>
                <line
                  x1={PADDING.left}
                  y1={y}
                  x2={CANVAS_WIDTH - PADDING.right}
                  y2={y}
                  stroke="#C4A87A"
                  strokeOpacity={0.2}
                  strokeDasharray={intVal === 0 ? undefined : '3,3'}
                  strokeWidth={intVal === 0 ? 1.5 : 1}
                />
                <text
                  x={PADDING.left - 8}
                  y={y + 4}
                  fill="#5c3d22"
                  fontSize={11}
                  fontFamily="Inter"
                  fontWeight={600}
                  textAnchor="end"
                >
                  {intVal}
                </text>
              </g>
            );
          })}

          {/* X Grid & Time Labels (0, 4, 8, 12, 16, 20s) */}
          {[0, 4, 8, 12, 16, 20].map((tVal) => {
            const x = timeToX(tVal);
            return (
              <g key={`x-grid-${tVal}`}>
                <line
                  x1={x}
                  y1={PADDING.top}
                  x2={x}
                  y2={CANVAS_HEIGHT - PADDING.bottom}
                  stroke="#C4A87A"
                  strokeOpacity={0.2}
                  strokeDasharray="3,3"
                />
                <text
                  x={x}
                  y={CANVAS_HEIGHT - PADDING.bottom + 16}
                  fill="#5c3d22"
                  fontSize={11}
                  fontFamily="Inter"
                  fontWeight={600}
                  textAnchor="middle"
                >
                  {tVal}s
                </text>
              </g>
            );
          })}

          {/* X and Y Axis Titles */}
          <text
            x={CANVAS_WIDTH / 2}
            y={CANVAS_HEIGHT - 4}
            fill="#5c3d22"
            fontSize={12}
            fontFamily="Inter"
            fontWeight={700}
            textAnchor="middle"
          >
            {t('timeSeconds', language)}
          </text>
          <text
            x={14}
            y={CANVAS_HEIGHT / 2}
            fill="#5c3d22"
            fontSize={12}
            fontFamily="Inter"
            fontWeight={700}
            textAnchor="middle"
            transform={`rotate(-90 14 ${CANVAS_HEIGHT / 2})`}
          >
            {t('intensityScale', language)}
          </text>

          {/* Render Sleek 2px Spline Curves for each active tag */}
          {activeTags.map((tag) => {
            const curve = finishCurves[tag] ?? getDefaultCurve(tag, noseTagIntensities, tasteTagIntensities);
            const color = getFlavorColor(tag);
            const isHovered = hoveredTag === tag;
            const pathD = getCurvePath(curve);

            const xStart = timeToX(curve.startTime);
            const xEnd = timeToX(curve.endTime);

            return (
              <g
                key={`curve-${tag}`}
                onMouseEnter={() => setHoveredTag(tag)}
                onMouseLeave={() => setHoveredTag(null)}
                className="transition-opacity duration-150"
                opacity={hoveredTag === null || isHovered ? 1 : 0.2}
              >
                {/* Sleek Line Curve (2px stroke) */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered ? 3.5 : 2.25}
                  strokeOpacity={0.9}
                  strokeLinecap="round"
                />

                {/* Subtle Fill Gradient underneath curve */}
                <path
                  d={`${pathD} L ${xEnd} ${intensityToY(0)} L ${xStart} ${intensityToY(0)} Z`}
                  fill={color}
                  fillOpacity={isHovered ? 0.22 : 0.08}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Prominent Multi-Slider Control Panel */}
      <div className="flex flex-col gap-3 w-full bg-[#1A120B]/5 p-3.5 sm:p-4 rounded-md border border-[#C4A87A]/50">
        <span className="text-xs sm:text-[13px] font-bold uppercase tracking-wider text-[#8c6440] font-body">
          {t('activeFlavors', language)} Slider Controls ({activeTags.length})
        </span>

        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5',
            activeTags.length > 6 && 'max-h-[380px] overflow-y-auto pr-1.5'
          )}
        >
          {activeTags.map((tag) => {
            const curve = finishCurves[tag] ?? getDefaultCurve(tag, noseTagIntensities, tasteTagIntensities);
            const color = getFlavorColor(tag);
            const displayTagName = translateFlavorTag(tag, language);
            const isHovered = hoveredTag === tag;

            return (
              <div
                key={`slider-panel-${tag}`}
                onMouseEnter={() => setHoveredTag(tag)}
                onMouseLeave={() => setHoveredTag(null)}
                className={cn(
                  'flex flex-col gap-3 p-3.5 rounded-md border transition-all',
                  isHovered
                    ? 'border-[#C59B27] bg-[#1A120B]/12 shadow-sm'
                    : 'border-[#C4A87A]/40 bg-[#1A120B]/5'
                )}
              >
                {/* Header with Color Pill Indicator */}
                <div className="flex items-center gap-2 border-b border-[#C4A87A]/30 pb-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/30 shadow-xs"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-body text-xs sm:text-sm font-bold text-[#1A120B] truncate">
                    {displayTagName}
                  </span>
                </div>

                {/* 3 Prominent Range Sliders per active flavor */}
                <div className="flex flex-col gap-2.5 font-body">
                  {/* Slider 1: Start Time */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs text-[#8c6440]">
                      <span className="font-semibold">{t('startTime', language)}</span>
                      <span className="font-bold text-[#1A120B] text-xs sm:text-sm">{curve.startTime}s</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(0, curve.peakTime - 0.5)}
                      step={0.5}
                      value={curve.startTime}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onChangeCurves({
                          ...finishCurves,
                          [tag]: { ...curve, startTime: val },
                        });
                      }}
                      className="h-2.5 w-full cursor-pointer accent-[#C59B27] rounded-lg"
                      aria-label={`${displayTagName} ${t('startTime', language)}`}
                    />
                  </div>

                  {/* Slider 2: Peak Intensity */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs text-[#8c6440]">
                      <span className="font-semibold">{t('peakIntensity', language)}</span>
                      <span className="font-bold text-[#1A120B] text-xs sm:text-sm">{curve.peakIntensity} / 10</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={curve.peakIntensity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onChangeCurves({
                          ...finishCurves,
                          [tag]: { ...curve, peakIntensity: val },
                        });
                      }}
                      className="h-2.5 w-full cursor-pointer accent-[#C59B27] rounded-lg"
                      aria-label={`${displayTagName} ${t('peakIntensity', language)}`}
                    />
                  </div>

                  {/* Slider 3: End Time / Duration */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs text-[#8c6440]">
                      <span className="font-semibold">{t('finishDuration', language)}</span>
                      <span className="font-bold text-[#1A120B] text-xs sm:text-sm">{curve.endTime}s</span>
                    </div>
                    <input
                      type="range"
                      min={Math.max(3, curve.peakTime + 1)}
                      max={20}
                      step={1}
                      value={curve.endTime}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onChangeCurves({
                          ...finishCurves,
                          [tag]: { ...curve, endTime: val },
                        });
                      }}
                      className="h-2.5 w-full cursor-pointer accent-[#C59B27] rounded-lg"
                      aria-label={`${displayTagName} ${t('finishDuration', language)}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

