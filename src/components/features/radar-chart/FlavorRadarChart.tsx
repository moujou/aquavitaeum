'use client';

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { FlavorProfile } from '@/types/spirit.types';
import { useLanguage } from '@/context/LanguageContext';
import { translateRadarDimension } from '@/lib/i18n/translations';
import { getDescriptorsByRadarDimension, translateFlavorTag } from '@/data/spirit-flavor-taxonomy';
import { isTagSelected } from '@/components/features/flavor-tags/FlavorTagSelector';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlavorRadarChartProps {
  noseProfile: FlavorProfile;
  tasteProfile: FlavorProfile;
  noseFlavorTags?: string[];
  tasteFlavorTags?: string[];
  noseTagIntensities?: Record<string, number>;
  tasteTagIntensities?: Record<string, number>;
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

// ─── Constants ────────────────────────────────────────────────────────────────

export const DIMENSIONS: { key: keyof FlavorProfile; label: string }[] = [
  { key: 'fruity',    label: 'Fruity' },
  { key: 'floral',    label: 'Floral' },
  { key: 'spicy',     label: 'Spicy' },
  { key: 'cereal',    label: 'Cereal' },
  { key: 'peaty',     label: 'Peaty' },
  { key: 'sulphury',  label: 'Sulphury' },
  { key: 'feinty',    label: 'Feinty' },
  { key: 'nutty',     label: 'Nutty' },
  { key: 'woody',     label: 'Woody' },
  { key: 'winey',     label: 'Winey' },
  { key: 'chocolate', label: 'Chocolate' },
];

// Helper to compute radar dimension score from active tag intensities
export function computeRadarDimensionScore(
  dimKey: keyof FlavorProfile,
  activeTags: string[],
  tagIntensities: Record<string, number>,
): number {
  const dimDescriptors = getDescriptorsByRadarDimension(dimKey);
  const activeForDim = dimDescriptors.filter((d) => isTagSelected(d, activeTags));

  if (activeForDim.length === 0) {
    // If no active tags exist under this dimension, return 0 for realtime zeroing
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

  return Math.round(Math.max(...scores));
}

// ─── Component 1: Dynamic Standalone Radar Chart ───────────────────────────────

export function FlavorRadarChart({
  noseFlavorTags = [],
  tasteFlavorTags = [],
  noseTagIntensities = {},
  tasteTagIntensities = {},
  className,
}: FlavorRadarChartProps) {
  const { language } = useLanguage();

  const chartData = DIMENSIONS.map(({ key, label }) => {
    const noseScore = computeRadarDimensionScore(key, noseFlavorTags, noseTagIntensities);
    const tasteScore = computeRadarDimensionScore(key, tasteFlavorTags, tasteTagIntensities);

    const dimDescriptors = getDescriptorsByRadarDimension(key);
    const activeNoseDesc = dimDescriptors
      .filter((d) => isTagSelected(d, noseFlavorTags))
      .map((d) => d.name[language] ?? d.name.EN);
    const activeTasteDesc = dimDescriptors
      .filter((d) => isTagSelected(d, tasteFlavorTags))
      .map((d) => d.name[language] ?? d.name.EN);

    return {
      dimensionKey: key,
      dimension: translateRadarDimension(label, language),
      Nose: noseScore,
      Taste: tasteScore,
      activeNoseTags: activeNoseDesc,
      activeTasteTags: activeTasteDesc,
    };
  });

  const noseLegend = language === 'DE' ? 'Nase' : 'Nose';
  const tasteLegend = language === 'DE' ? 'Geschmack' : 'Taste';

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      <div className="w-full flex justify-center bg-[#1A120B]/8 border border-[#C4A87A]/60 rounded-md p-2 shadow-inner overflow-hidden select-none">
        <ResponsiveContainer width="100%" height={440}>
          <RadarChart data={chartData} margin={{ top: 16, right: 40, bottom: 16, left: 40 }}>
            <PolarGrid stroke="#c4a87a" strokeOpacity={0.5} />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#5c3d22', fontSize: 12, fontFamily: 'Inter', fontWeight: 700 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name={noseLegend}
              dataKey="Nose"
              stroke="#C59B27"
              fill="#C59B27"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Radar
              name={tasteLegend}
              dataKey="Taste"
              stroke="#2A5E3F"
              fill="#2A5E3F"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: 12, fontFamily: 'Inter', color: '#5c3d22', fontWeight: 600 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;

                return (
                  <div className="bg-[#F5EEDC] border border-[#C4A87A] rounded-sm p-3 shadow-md text-xs font-body text-[#1A120B] max-w-[240px]">
                    <p className="font-display font-bold uppercase tracking-wider text-[#5c3d22] text-xs mb-1.5 border-b border-[#C4A87A]/60 pb-1">
                      {data.dimension}
                    </p>
                    <div className="flex flex-col gap-1.5 mb-2">
                      <div className="flex flex-col gap-0.5 text-[#8c6440]">
                        <div className="flex items-center justify-between font-semibold">
                          <span>{noseLegend}:</span>
                          <span className="font-bold text-[#C59B27]">{data.Nose} / 10</span>
                        </div>
                        {data.activeNoseTags.length > 0 && (
                          <p className="text-[11px] text-[#1A120B] italic leading-tight pl-2">
                            {data.activeNoseTags.map((tag: string) => translateFlavorTag(tag, language)).join(', ')}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 text-[#8c6440] border-t border-[#C4A87A]/40 pt-1.5">
                        <div className="flex items-center justify-between font-semibold">
                          <span>{tasteLegend}:</span>
                          <span className="font-bold text-[#2A5E3F]">{data.Taste} / 10</span>
                        </div>
                        {data.activeTasteTags.length > 0 && (
                          <p className="text-[11px] text-[#1A120B] italic leading-tight pl-2">
                            {data.activeTasteTags.map((tag: string) => translateFlavorTag(tag, language)).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Component 2: Dynamic Profile Sliders for Active Flavor Tags ─────────────────

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
  const accentClass = isNose ? 'accent-[#C59B27]' : 'accent-[#2A5E3F]';
  const valueColorClass = isNose ? 'text-amber-900 font-bold' : 'text-green-950 font-bold';

  if (activeTags.length === 0) {
    return (
      <div className={cn('flex flex-col gap-2 w-full', className)}>
        <div className="flex items-center justify-between border-b border-[#C4A87A]/50 pb-1">
          <SectionHeader>{title}</SectionHeader>
        </div>
        <p className="text-xs text-[#755030] italic py-3 text-center border border-dashed border-[#C4A87A]/40 rounded-sm">
          {language === 'DE'
            ? `Wähle oben Aromen für ${isNose ? 'Nase' : 'Geschmack'} aus, um Intensitäts-Regler hinzuzufügen.`
            : `Select flavor tags under ${isNose ? 'Nose' : 'Taste'} above to add intensity sliders.`}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      <div className="flex items-center justify-between border-b border-[#C4A87A]/50 pb-1">
        <SectionHeader>
          {title} ({activeTags.length})
        </SectionHeader>
        <span className="text-xs text-[#755030] font-body italic">0-10 Scale</span>
      </div>

      <div className="flex flex-col gap-2">
        {activeTags.map((tagName) => {
          const val = tagIntensities[tagName] ?? 5;
          const displayTagName = translateFlavorTag(tagName, language);

          return (
            <div
              key={tagName}
              className="grid grid-cols-[130px_1fr_24px] items-center gap-2.5 bg-[#1A120B]/5 px-2.5 py-1.5 rounded-sm border border-[#C4A87A]/40"
            >
              <span className="font-body text-xs sm:text-[13px] font-bold text-[#1A120B] truncate" title={displayTagName}>
                {displayTagName}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={val}
                onChange={(e) => onIntensityChange(tagName, Number(e.target.value))}
                className={cn('h-1.5 cursor-pointer', accentClass)}
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
  const accentClass = isNose ? 'accent-[#C59B27]' : 'accent-[#2A5E3F]';
  const valueColorClass = isNose ? 'text-amber-900 font-bold' : 'text-green-950 font-bold';

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      <div className="flex items-center justify-between border-b border-[#C4A87A]/50 pb-1">
        <span className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-[#8c6440] font-body">
          {title}
        </span>
        <span className="text-xs text-[#8c6440] font-body italic">0-10 Scale</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {DIMENSIONS.map(({ key, label }) => {
          const val = profile[key];
          const translatedLabel = translateRadarDimension(label, language);

          return (
            <div
              key={key}
              className="grid grid-cols-[95px_1fr_24px] items-center gap-2.5"
            >
              <span className="font-body text-xs sm:text-sm font-bold text-[#1A120B] truncate">
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
