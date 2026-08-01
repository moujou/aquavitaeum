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
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlavorRadarChartProps {
  noseProfile: FlavorProfile;
  tasteProfile: FlavorProfile;
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

function buildChartData(nose: FlavorProfile, taste: FlavorProfile) {
  return DIMENSIONS.map(({ key, label }) => ({
    dimension: label,
    Nose:  nose[key],
    Taste: taste[key],
  }));
}

// ─── Component 1: Standalone Radar Chart ──────────────────────────────────────

export function FlavorRadarChart({
  noseProfile,
  tasteProfile,
  className,
}: FlavorRadarChartProps) {
  const chartData = buildChartData(noseProfile, tasteProfile);

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      <div className="w-full flex justify-center">
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={chartData} margin={{ top: 12, right: 30, bottom: 12, left: 30 }}>
            <PolarGrid stroke="#c4a87a" strokeOpacity={0.5} />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#5c3d22', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Nose"
              dataKey="Nose"
              stroke="#C59B27"
              fill="#C59B27"
              fillOpacity={0.25}
              strokeWidth={2}
            />
            <Radar
              name="Taste"
              dataKey="Taste"
              stroke="#2A5E3F"
              fill="#2A5E3F"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, fontFamily: 'Inter', color: '#5c3d22', fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{
                background: '#F5EEDC',
                border: '1px solid #C4A87A',
                borderRadius: 4,
                fontSize: 11,
                fontFamily: 'Inter',
                color: '#1A120B',
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Component 2: Single Profile Sliders (Nose or Taste) ───────────────────────

export function SingleProfileSliders({
  title,
  profile,
  type,
  onChange,
  className,
}: SingleProfileSlidersProps) {
  const isNose = type === 'nose';
  const accentClass = isNose ? 'accent-[#C59B27]' : 'accent-[#2A5E3F]';
  const valueColorClass = isNose ? 'text-amber-900 font-bold' : 'text-green-950 font-bold';

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      <div className="flex items-center justify-between border-b border-[#C4A87A]/50 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8c6440] font-body">
          {title}
        </span>
        <span className="text-[9px] text-[#8c6440] font-body italic">0–10 Scale</span>
      </div>

      <div className="flex flex-col gap-1">
        {DIMENSIONS.map(({ key, label }) => {
          const val = profile[key];
          return (
            <div
              key={key}
              className="grid grid-cols-[85px_1fr_20px] items-center gap-2"
            >
              <span className="font-body text-xs font-semibold text-[#1A120B] truncate">
                {label}
              </span>
              <input
                type="range"
                min={0}
                max={10}
                step={1}
                value={val}
                onChange={(e) => onChange(key, Number(e.target.value))}
                className={cn('h-1 cursor-pointer accent-[#C59B27]', accentClass)}
                aria-label={`${title} ${label}`}
              />
              <span className={cn('text-right text-xs', valueColorClass)}>
                {val}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
