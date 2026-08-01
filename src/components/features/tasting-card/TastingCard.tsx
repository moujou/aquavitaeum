'use client';

import { RotateCcw, CheckCircle, Pencil, Check, Trash2 } from 'lucide-react';
import { Spirit, SpiritType, SpiritColour, SpiritGlance, SpiritFinishDuration } from '@/types/spirit.types';
import { FlavorRadarChart, SingleProfileSliders } from '@/components/features/radar-chart/FlavorRadarChart';
import { FlavorTagSelector } from '@/components/features/tasting-wheel/FlavorTagSelector';
import { SpiritPhotoCarousel } from '@/components/features/photos/SpiritPhotoCarousel';
import { RatingStars } from '@/components/ui/RatingStars';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTastingCardForm } from '@/hooks/useTastingCardForm';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const SPIRIT_TYPES: SpiritType[] = [
  'Single Malt Scotch', 'Blended Scotch', 'Bourbon', 'Irish Whiskey',
  'Japanese Whisky', 'Rye Whiskey', 'Rum', 'Gin', 'Tequila', 'Mezcal',
  'Cognac', 'Armagnac', 'Other',
];

const COLOURS: { value: SpiritColour; hex: string }[] = [
  { value: 'Dark Oak',    hex: '#3B1A05' },
  { value: 'Mahogany',   hex: '#6B2D0F' },
  { value: 'Copper',     hex: '#B87333' },
  { value: 'Amber',      hex: '#FFBF00' },
  { value: 'Gold',       hex: '#FFD700' },
  { value: 'Honey',      hex: '#FFC04D' },
  { value: 'Straw',      hex: '#E8D8A0' },
  { value: 'White Wine', hex: '#F5F0DC' },
  { value: 'Clear',      hex: '#F0F4FF' },
];

const GLANCES: SpiritGlance[] = ['Watery', 'Oily', 'Creamy', 'Smooth'];
const FINISHES: SpiritFinishDuration[] = ['Short', 'Medium', 'Long'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] font-semibold uppercase tracking-widest text-[#8c6440] font-body">
      {children}
    </label>
  );
}

function TextInput({
  id, value, onChange, placeholder, className,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full bg-transparent border-b border-[#C4A87A] pb-0.5 text-sm text-[#1A120B]',
        'placeholder:text-[#c4a87a] font-body focus:outline-none focus:border-[#5c3d22]',
        'transition-colors duration-150',
        className,
      )}
    />
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface TastingCardProps {
  initialSpirit?: Spirit;
  onSave?: (spirit: Spirit) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function TastingCard({ initialSpirit, onSave, onDelete, className }: TastingCardProps) {
  const {
    spirit,
    saved,
    showDeleteModal,
    setShowDeleteModal,
    isEditingTitle,
    setIsEditingTitle,
    stars,
    displayName,
    subtitleLocation,
    update,
    updateProfile,
    handleSave,
    handleReset,
    confirmDelete,
  } = useTastingCardForm(initialSpirit, onSave, onDelete);

  return (
    <div className={cn('parchment rounded-lg overflow-hidden animate-fade-in-up', className)}>
      
      {/* ── Dynamic Header Banner ─────────────────────────────────────────── */}
      <div className="bg-[#1A120B] text-center py-4 px-6 border-b border-[#C4A87A] flex flex-col items-center justify-center gap-1">
        {/* Spirit Type Badge */}
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-[#C4A87A]">
          {spirit.spiritType}
        </span>

        {/* Big Spirit Name (Editable inline with Pencil icon) */}
        {isEditingTitle ? (
          <div className="flex items-center gap-2 max-w-md w-full my-1">
            <input
              id="header-name-edit-input"
              type="text"
              value={spirit.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Spirit / Bottling Name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') setIsEditingTitle(false);
              }}
              className="w-full bg-[#F5EEDC] text-[#1A120B] font-display text-lg font-bold px-3 py-1 rounded border border-[#C59B27] focus:outline-none text-center uppercase tracking-wider"
            />
            <button
              type="button"
              onClick={() => setIsEditingTitle(false)}
              className="p-1.5 rounded-full bg-[#C59B27] text-[#1A120B] hover:bg-[#e8c247] transition-colors cursor-pointer"
              title="Done editing name"
            >
              <Check size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-widest text-[#F5EEDC] uppercase leading-tight">
              {displayName}
            </h1>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="p-1 rounded text-[#C4A87A] opacity-60 group-hover:opacity-100 hover:text-[#C59B27] transition-opacity cursor-pointer"
              title="Edit Spirit Name"
            >
              <Pencil size={14} />
            </button>
          </div>
        )}

        {/* Subtitle */}
        <p className="font-display text-[10px] uppercase tracking-[0.25em] text-[#a07d1a] italic">
          {subtitleLocation}
        </p>
      </div>

      <div className="p-6 flex flex-col gap-6">

        {/* ── Top Section: 2 Balanced Columns ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Metadata, Colour/Glance & Active Flavors */}
          <div className="lg:col-span-6 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-[#D4C3A3] pb-6 lg:pb-0 lg:pr-6">

            {/* Spirit Type */}
            <div className="flex flex-col gap-1">
              <FieldLabel>Spirit Type</FieldLabel>
              <select
                id="spirit-type-select"
                value={spirit.spiritType}
                onChange={(e) => update('spiritType', e.target.value as SpiritType)}
                className="w-full bg-transparent border-b border-[#C4A87A] pb-0.5 text-sm text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22] cursor-pointer"
              >
                {SPIRIT_TYPES.map((t) => (
                  <option key={t} value={t} className="bg-[#F5EEDC] text-[#1A120B]">{t}</option>
                ))}
              </select>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
              <div className="col-span-2 flex flex-col gap-1">
                <FieldLabel>Distillery / Producer</FieldLabel>
                <TextInput id="distillery-input" value={spirit.distillery} onChange={(v) => update('distillery', v)} placeholder="e.g. Laphroaig" />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <FieldLabel>Name</FieldLabel>
                <TextInput id="name-input" value={spirit.name} onChange={(v) => update('name', v)} placeholder="e.g. 10 Year Old" />
              </div>
              <div className="col-span-2 flex flex-col gap-1">
                <FieldLabel>Region / Origin</FieldLabel>
                <TextInput id="region-input" value={spirit.region} onChange={(v) => update('region', v)} placeholder="e.g. Islay, Scotland" />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Age</FieldLabel>
                <input
                  id="age-input"
                  type="number"
                  min={0}
                  max={100}
                  value={spirit.age ?? ''}
                  placeholder="Years"
                  onChange={(e) => update('age', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-transparent border-b border-[#C4A87A] pb-0.5 text-sm text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22] placeholder:text-[#c4a87a]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Cask / Batch No.</FieldLabel>
                <TextInput id="cask-input" value={spirit.caskNo ?? ''} onChange={(v) => update('caskNo', v)} placeholder="Optional" />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>ABV %</FieldLabel>
                <input
                  id="abv-input"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={spirit.abv}
                  onChange={(e) => update('abv', Number(e.target.value))}
                  className="w-full bg-transparent border-b border-[#C4A87A] pb-0.5 text-sm text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>Date Tasted</FieldLabel>
                <input
                  id="date-tasted-input"
                  type="date"
                  value={spirit.dateTasted}
                  onChange={(e) => update('dateTasted', e.target.value)}
                  className="w-full bg-transparent border-b border-[#C4A87A] pb-0.5 text-sm text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22]"
                />
              </div>
              {/* Full-width Finish free text input */}
              <div className="col-span-2 flex flex-col gap-1 mt-1">
                <FieldLabel>Finish</FieldLabel>
                <TextInput
                  id="finish-notes-input"
                  value={spirit.finishNotes ?? ''}
                  onChange={(v) => update('finishNotes', v)}
                  placeholder="e.g. Oloroso Sherry Cask Finish, Pedro Ximénez Cask Finish, Port Cask Finish"
                />
              </div>

              {/* Trio of Tasting Checkboxes */}
              <div className="col-span-2 flex flex-wrap items-center gap-5 mt-1 pt-1">
                {/* 1. Cask Strength */}
                <div className="flex items-center gap-2">
                  <input
                    id="cask-strength-checkbox"
                    type="checkbox"
                    checked={spirit.isCaskStrength ?? false}
                    onChange={(e) => update('isCaskStrength', e.target.checked)}
                    className="accent-[#5c3d22] w-3.5 h-3.5 cursor-pointer"
                  />
                  <label htmlFor="cask-strength-checkbox" className="text-xs text-[#5c3d22] font-body font-medium cursor-pointer select-none">
                    Cask Strength
                  </label>
                </div>

                {/* 2. Added water */}
                <div className="flex items-center gap-2">
                  <input
                    id="added-water-checkbox"
                    type="checkbox"
                    checked={spirit.addedWater ?? false}
                    onChange={(e) => update('addedWater', e.target.checked)}
                    className="accent-[#5c3d22] w-3.5 h-3.5 cursor-pointer"
                  />
                  <label htmlFor="added-water-checkbox" className="text-xs text-[#5c3d22] font-body font-medium cursor-pointer select-none">
                    Added water
                  </label>
                </div>

                {/* 3. On the rocks */}
                <div className="flex items-center gap-2">
                  <input
                    id="on-the-rocks-checkbox"
                    type="checkbox"
                    checked={spirit.onTheRocks ?? false}
                    onChange={(e) => update('onTheRocks', e.target.checked)}
                    className="accent-[#5c3d22] w-3.5 h-3.5 cursor-pointer"
                  />
                  <label htmlFor="on-the-rocks-checkbox" className="text-xs text-[#5c3d22] font-body font-medium cursor-pointer select-none">
                    On the rocks
                  </label>
                </div>
              </div>
            </div>

            {/* Colour & Glance section */}
            <div className="border-t border-[#D4C3A3] pt-4 flex flex-col gap-3">
              <div className="flex gap-4">
                {/* Vertical colour scale */}
                <div className="flex flex-col items-start gap-1 flex-1">
                  <FieldLabel>Colour</FieldLabel>
                  <div className="mt-1 flex flex-col gap-1 w-full">
                    {COLOURS.map(({ value, hex }) => (
                      <button
                        key={value}
                        id={`colour-${value.toLowerCase().replace(/\s+/g, '-')}`}
                        type="button"
                        onClick={() => update('colour', value)}
                        className={cn(
                          'flex items-center gap-2.5 px-2 py-1 rounded-sm transition-all text-left w-full cursor-pointer',
                          spirit.colour === value
                            ? 'bg-[#1A120B] ring-1 ring-[#C59B27] font-semibold text-[#F5EEDC]'
                            : 'hover:bg-[#1A120B]/10 text-[#5c3d22]',
                        )}
                        aria-pressed={spirit.colour === value}
                      >
                        <span
                          className="w-4.5 h-4.5 rounded-sm border border-[#C4A87A] flex-shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="text-xs font-medium font-body whitespace-nowrap">
                          {value}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Glance / Mouthfeel */}
                <div className="flex flex-col flex-1 gap-1">
                  <FieldLabel>Glance / Mouthfeel</FieldLabel>
                  <div className="mt-1 grid grid-cols-1 gap-1">
                    {GLANCES.map((g) => (
                      <button
                        key={g}
                        id={`glance-${g.toLowerCase()}`}
                        type="button"
                        onClick={() => update('glance', g)}
                        className={cn(
                          'px-2 py-1 rounded-sm border text-[11px] font-body font-medium transition-all text-center cursor-pointer',
                          spirit.glance === g
                            ? 'bg-[#1A120B] border-[#C59B27] text-[#F5EEDC] font-semibold'
                            : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                        )}
                        aria-pressed={spirit.glance === g}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Active Flavors & Flavor Profile (Left Column) */}
            <div className="border-t border-[#D4C3A3] pt-4 flex flex-col gap-2 w-full">
              <FieldLabel>Active Flavors & Flavor Profile</FieldLabel>
              <FlavorTagSelector
                selectedTags={spirit.flavorTags}
                onChange={(tags) => update('flavorTags', tags)}
                className="mt-1 w-full"
              />
            </div>

          </div>

          {/* Right Column: Photos, Radar Graph, Nose Sliders & Taste Sliders */}
          <div className="lg:col-span-6 flex flex-col gap-5">

            {/* Spirit Photos Carousel (Top of Right Column) */}
            <div className="flex flex-col gap-2">
              <FieldLabel>Spirit Photos</FieldLabel>
              <SpiritPhotoCarousel
                images={spirit.images}
                onChange={(imgs) => update('images', imgs)}
              />
            </div>

            {/* Radar Graph (Directly under Photo Carousel) */}
            <div className="flex flex-col gap-2 border-t border-[#D4C3A3] pt-4">
              <div className="flex items-center justify-between">
                <FieldLabel>Nose & Taste Radar</FieldLabel>
              </div>
              <FlavorRadarChart
                noseProfile={spirit.noseProfile}
                tasteProfile={spirit.tasteProfile}
              />
            </div>

            {/* Nose Sliders Section (Right Column under Radar Graph) */}
            <div className="border-t border-[#D4C3A3] pt-4">
              <SingleProfileSliders
                title="Nose Intensity"
                profile={spirit.noseProfile}
                type="nose"
                onChange={(key, val) => updateProfile('noseProfile', key, val)}
              />
            </div>

            {/* Taste Sliders Section (Right Column under Nose Sliders) */}
            <div className="border-t border-[#D4C3A3] pt-4">
              <SingleProfileSliders
                title="Taste Intensity"
                profile={spirit.tasteProfile}
                type="taste"
                onChange={(key, val) => updateProfile('tasteProfile', key, val)}
              />
            </div>

          </div>

        </div>

        {/* ── Full-Width Section 2 (100% Row): Finish Length & Finish Notes ───────────── */}
        <section className="border-t border-[#D4C3A3] pt-5 flex flex-col gap-4 w-full" aria-label="Finish">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>Finish Length</FieldLabel>
            <div className="flex gap-2">
              {FINISHES.map((f) => (
                <button
                  key={f}
                  id={`finish-${f.toLowerCase()}`}
                  type="button"
                  onClick={() => update('finish', f)}
                  className={cn(
                    'px-4 py-1.5 rounded-sm border text-xs font-display uppercase tracking-wider font-semibold transition-all cursor-pointer',
                    spirit.finish === f
                      ? 'bg-[#1A120B] border-[#C59B27] text-[#C59B27] shadow-xs'
                      : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                  )}
                  aria-pressed={spirit.finish === f}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Finish Notes</FieldLabel>
            <textarea
              id="finish-notes-textarea"
              value={spirit.finishNotes}
              onChange={(e) => update('finishNotes', e.target.value)}
              rows={3}
              placeholder="Describe the lingering finish, warmth, and persistence…"
              className={cn(
                'w-full bg-transparent border border-[#C4A87A] rounded-sm p-3.5',
                'text-xs text-[#1A120B] font-body placeholder:text-[#c4a87a] leading-relaxed',
                'focus:outline-none focus:border-[#5c3d22] resize-none transition-colors',
              )}
            />
          </div>
        </section>

        {/* ── Full-Width Section 3 (100% Row): Score & Rating Section ──── */}
        <section className="border-t border-[#D4C3A3] pt-5 flex flex-col gap-4 w-full" aria-label="Score & Rating Section">
          <FieldLabel>Score & Rating Section</FieldLabel>
          <div className="bg-[#1A120B]/5 p-4 rounded border border-[#C4A87A]/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Rating Score & Enlarged Stars */}
            <div className="flex items-center gap-5 w-full sm:w-auto">
              <div className="flex flex-col items-center">
                <FieldLabel>Score</FieldLabel>
                <span className="font-display text-4xl font-bold text-[#1A120B] leading-none mt-1">
                  {spirit.rating100}
                </span>
              </div>
              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <RatingStars stars={stars} size={24} />
              </div>
            </div>

            {/* Rating Slider */}
            <div className="flex-1 max-w-md w-full flex items-center gap-3">
              <span className="text-xs text-[#8c6440] font-body font-semibold">1</span>
              <input
                id="rating-slider"
                type="range"
                min={1}
                max={100}
                value={spirit.rating100}
                onChange={(e) => update('rating100', Number(e.target.value))}
                className="flex-1 accent-[#C59B27] h-2 cursor-pointer"
                aria-label="Rating score"
              />
              <span className="text-xs text-[#8c6440] font-body font-semibold">100</span>
            </div>
          </div>

          {/* Pub Dark Iron & Brass Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-end items-center">
            {onDelete && (
              <button
                id="tasting-card-delete"
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 rounded-sm border border-red-900/60 bg-red-950/20',
                  'text-xs font-display uppercase tracking-wider font-semibold text-red-900 hover:bg-red-900 hover:text-white transition-colors cursor-pointer',
                )}
              >
                <Trash2 size={13} />
                Delete Tasting Note
              </button>
            )}
            <button
              id="tasting-card-reset"
              type="button"
              onClick={handleReset}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 rounded-sm border border-[#C4A87A]',
                'text-xs font-display uppercase tracking-wider font-semibold text-[#5c3d22] hover:bg-[#1A120B] hover:text-[#F5EEDC] hover:border-[#1A120B] transition-colors cursor-pointer',
              )}
            >
              <RotateCcw size={13} />
              Reset
            </button>
            <button
              id="tasting-card-save"
              type="button"
              onClick={handleSave}
              className={cn(
                'min-w-[160px] flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-sm border',
                'text-xs font-display uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer',
                saved
                  ? 'bg-green-800 text-white border-green-800'
                  : 'bg-[#1A120B] text-[#F5EEDC] border-[#C59B27] hover:bg-[#2A1B12] hover:border-[#e8c247]',
              )}
            >
              <CheckCircle size={13} />
              {saved ? 'Saved!' : 'Save Tasting Note'}
            </button>
          </div>
        </section>

      </div>

      {/* ── Delete Confirmation Modal Pop-up ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title="Delete Tasting Note?"
        subtitle="This action cannot be undone."
        message={
          <>
            Are you sure you want to permanently delete the tasting note for{' '}
            <strong className="font-semibold text-[#1A120B]">{displayName}</strong>?
          </>
        }
        confirmLabel="Yes, Delete Note"
        cancelLabel="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
