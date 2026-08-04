'use client';

import { RotateCcw, CheckCircle, Pencil, Check, Trash2 } from 'lucide-react';
import { Spirit, SpiritType, SpiritColour, SUPPORTED_CURRENCIES, Currency, SPIRIT_TYPES, SPIRIT_GLANCES, SPIRIT_FINISH_DURATIONS, SPIRIT_COLOURS, SPIRIT_COLOUR_HEX } from '@/types/spirit.types';
import { FlavorRadarChart, DynamicProfileSliders } from '@/components/features/radar-chart/FlavorRadarChart';
import { FlavorTagSelector } from '@/components/features/tasting-wheel/FlavorTagSelector';
import { SpiritPhotoCarousel } from '@/components/features/photos/SpiritPhotoCarousel';
import { RatingStars } from '@/components/ui/RatingStars';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LocalizedDatePicker } from '@/components/ui/LocalizedDatePicker';
import { useTastingCardForm } from '@/hooks/useTastingCardForm';
import { useLanguage } from '@/context/LanguageContext';
import { translateColour, translateGlance, translateFinish } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

// ─── UI presentation constants (derived from domain types) ───────────────────

/** Colour picker options — value + hex derived from the canonical SPIRIT_COLOUR_HEX map. */
const COLOURS: { value: SpiritColour; hex: string }[] = SPIRIT_COLOURS.map(
  (value) => ({ value, hex: SPIRIT_COLOUR_HEX[value] }),
);

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs sm:text-[13px] font-bold uppercase tracking-widest text-[#8c6440] font-body">
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
        'w-full bg-transparent border-b border-[#C4A87A] pb-1 text-sm sm:text-base text-[#1A120B]',
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
  const { language, t } = useLanguage();
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
    handleSave,
    handleReset,
    confirmDelete,
  } = useTastingCardForm(initialSpirit, onSave, onDelete);

  return (
    <div className={cn('parchment rounded-lg overflow-hidden animate-fade-in-up', className)}>
      
      {/* ── Dynamic Header Banner ─────────────────────────────────────────── */}
      <div className="bg-[#1A120B] text-center py-5 px-6 border-b border-[#C4A87A] flex flex-col items-center justify-center gap-1.5">
        {/* Spirit Type Badge */}
        <span className="font-display text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#C4A87A]">
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
              className="w-full bg-[#F5EEDC] text-[#1A120B] font-display text-xl sm:text-2xl font-bold px-3 py-1 rounded border border-[#C59B27] focus:outline-none text-center uppercase tracking-wider"
            />
            <button
              type="button"
              onClick={() => setIsEditingTitle(false)}
              className="p-1.5 rounded-full bg-[#C59B27] text-[#1A120B] hover:bg-[#e8c247] transition-colors cursor-pointer"
              title="Done editing name"
            >
              <Check size={18} />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2.5 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-widest text-[#F5EEDC] uppercase leading-tight">
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
              <Pencil size={16} />
            </button>
          </div>
        )}

        {/* Subtitle */}
        <p className="font-display text-xs sm:text-sm uppercase tracking-[0.25em] text-[#a07d1a] italic">
          {subtitleLocation}
        </p>
      </div>

      <div className="p-6 flex flex-col gap-6">

        {/* ── Top Section: 2 Balanced Columns ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Metadata, Colour/Glance & Active Flavors */}
          <div className="lg:col-span-6 flex flex-col gap-5 border-b lg:border-b-0 lg:border-r border-[#D4C3A3] pb-6 lg:pb-0 lg:pr-6">

            {/* Spirit Type */}
            <div className="flex flex-col gap-1.5">
              <FieldLabel>{t('spiritType')}</FieldLabel>
              <select
                id="spirit-type-select"
                value={spirit.spiritType}
                onChange={(e) => update('spiritType', e.target.value as SpiritType)}
                className="w-full bg-transparent border-b border-[#C4A87A] pb-1 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22] cursor-pointer"
              >
                {SPIRIT_TYPES.map((tVal) => (
                  <option key={tVal} value={tVal} className="bg-[#F5EEDC] text-[#1A120B]">{tVal}</option>
                ))}
              </select>
            </div>

            {/* Adjusted 2-Column Metadata Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              {/* Row 1: Distillery (Full Width) */}
              <div className="col-span-2 flex flex-col gap-1">
                <FieldLabel>{t('distilleryProducer')}</FieldLabel>
                <TextInput id="distillery-input" value={spirit.distillery} onChange={(v) => update('distillery', v)} placeholder="e.g. Laphroaig" />
              </div>

              {/* Row 2: Name (Full Width) */}
              <div className="col-span-2 flex flex-col gap-1">
                <FieldLabel>{t('spiritName')}</FieldLabel>
                <TextInput id="name-input" value={spirit.name} onChange={(v) => update('name', v)} placeholder="e.g. 10 Year Old" />
              </div>

              {/* Row 3: Region / Origin & Cask / Batch No. */}
              <div className="flex flex-col gap-1">
                <FieldLabel>{t('regionOrigin')}</FieldLabel>
                <TextInput id="region-input" value={spirit.region} onChange={(v) => update('region', v)} placeholder="e.g. Islay, Scotland" />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>{t('caskBatchNo')}</FieldLabel>
                <TextInput id="cask-input" value={spirit.caskNo ?? ''} onChange={(v) => update('caskNo', v)} placeholder="Optional" />
              </div>

              {/* Row 4: Age & Date Tasted */}
              <div className="flex flex-col gap-1">
                <FieldLabel>{t('ageYears')}</FieldLabel>
                <input
                  id="age-input"
                  type="number"
                  min={0}
                  max={100}
                  value={spirit.age ?? ''}
                  placeholder="Years"
                  onChange={(e) => update('age', e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-transparent border-b border-[#C4A87A] pb-1 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22] placeholder:text-[#c4a87a]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>{t('dateTasted')}</FieldLabel>
                <LocalizedDatePicker
                  id="date-tasted-input"
                  value={spirit.dateTasted}
                  onChange={(isoDate) => update('dateTasted', isoDate)}
                  language={language}
                />
              </div>

              {/* Row 5: ABV % & Bottle Price + Currency Selector */}
              <div className="flex flex-col gap-1">
                <FieldLabel>{t('abvPercent')}</FieldLabel>
                <input
                  id="abv-input"
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={spirit.abv}
                  onChange={(e) => update('abv', Number(e.target.value))}
                  className="w-full bg-transparent border-b border-[#C4A87A] pb-1 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none focus:border-[#5c3d22]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <FieldLabel>{t('bottlePrice')}</FieldLabel>
                <div className="flex items-center gap-1.5 border-b border-[#C4A87A]">
                  <input
                    id="price-input"
                    type="number"
                    min={0}
                    max={100000}
                    step={0.01}
                    value={spirit.price ?? ''}
                    placeholder="0.00"
                    onChange={(e) => update('price', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full bg-transparent pb-1 text-sm sm:text-base text-[#1A120B] font-body focus:outline-none placeholder:text-[#c4a87a]"
                  />
                  <select
                    id="currency-select"
                    value={spirit.currency ?? '€'}
                    onChange={(e) => update('currency', e.target.value as Currency)}
                    className="bg-transparent text-sm sm:text-base text-[#8c6440] font-body font-bold focus:outline-none cursor-pointer border-none pb-1 pr-0.5"
                    aria-label="Currency"
                  >
                    {SUPPORTED_CURRENCIES.map((curr) => (
                      <option key={curr} value={curr} className="bg-[#F5EEDC] text-[#1A120B]">
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 6: Finish free text input (Full Width) */}
              <div className="col-span-2 flex flex-col gap-1 mt-1">
                <FieldLabel>{t('finishType')}</FieldLabel>
                <TextInput
                  id="finish-notes-input"
                  value={spirit.finishNotes ?? ''}
                  onChange={(v) => update('finishNotes', v)}
                  placeholder="e.g. Oloroso Sherry Cask Finish, Pedro Ximénez Cask Finish, Port Cask Finish"
                />
              </div>

              {/* Row 7: Production Spec Toggle Buttons (Cask Strength, Added Colour, Chill Filtered) */}
              <div className="col-span-2 grid grid-cols-3 gap-2 mt-1.5 pt-1">
                {/* 1. Cask Strength */}
                <button
                  id="cask-strength-btn"
                  type="button"
                  onClick={() => update('isCaskStrength', !spirit.isCaskStrength)}
                  className={cn(
                    'px-3 py-1.5 rounded-sm border text-xs sm:text-sm font-body font-medium transition-all text-center cursor-pointer',
                    spirit.isCaskStrength
                      ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] font-semibold shadow-xs'
                      : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                  )}
                  aria-pressed={spirit.isCaskStrength ?? false}
                >
                  {t('caskStrength')}
                </button>

                {/* 2. Added Colour / Farbstoff */}
                <button
                  id="added-colour-btn"
                  type="button"
                  onClick={() => update('addedColour', !spirit.addedColour)}
                  className={cn(
                    'px-3 py-1.5 rounded-sm border text-xs sm:text-sm font-body font-medium transition-all text-center cursor-pointer',
                    spirit.addedColour
                      ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] font-semibold shadow-xs'
                      : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                  )}
                  aria-pressed={spirit.addedColour ?? false}
                >
                  {t('addedColour')}
                </button>

                {/* 3. Chill Filtered / Kühlgefiltert */}
                <button
                  id="chill-filtered-btn"
                  type="button"
                  onClick={() => update('chillFiltered', !spirit.chillFiltered)}
                  className={cn(
                    'px-3 py-1.5 rounded-sm border text-xs sm:text-sm font-body font-medium transition-all text-center cursor-pointer',
                    spirit.chillFiltered
                      ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] font-semibold shadow-xs'
                      : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                  )}
                  aria-pressed={spirit.chillFiltered ?? true}
                >
                  {t('chillFiltered')}
                </button>
              </div>
            </div>

            {/* Colour, Glance & Tasting Additions 2-Column Section */}
            <div className="border-t border-[#D4C3A3] pt-4 flex gap-4">
              {/* Left Sub-Column: Vertical colour scale */}
              <div className="flex flex-col items-start gap-1 flex-1">
                <FieldLabel>{t('colour')}</FieldLabel>
                <div className="mt-1 flex flex-col gap-1 w-full">
                  {COLOURS.map(({ value, hex }) => (
                    <button
                      key={value}
                      id={`colour-${value.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() => update('colour', value)}
                      className={cn(
                        'flex items-center gap-2.5 px-2.5 py-1 rounded-sm transition-all text-left w-full cursor-pointer',
                        spirit.colour === value
                          ? 'bg-[#3D2616] ring-1 ring-[#C59B27] font-semibold text-[#F5EEDC]'
                          : 'hover:bg-[#1A120B]/10 text-[#5c3d22]',
                      )}
                      aria-pressed={spirit.colour === value}
                    >
                      <span
                        className="w-4.5 h-4.5 rounded-sm border border-[#C4A87A] flex-shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span className="text-xs sm:text-sm font-medium font-body whitespace-nowrap">
                        {translateColour(value, language)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Sub-Column: Glance / Mouthfeel + Tasting Additions Stacked */}
              <div className="flex flex-col flex-1 gap-4">
                {/* Glance / Mouthfeel */}
                <div className="flex flex-col gap-1">
                  <FieldLabel>{t('glanceMouthfeel')}</FieldLabel>
                  <div className="mt-1 grid grid-cols-1 gap-1">
                    {SPIRIT_GLANCES.map((g) => (
                      <button
                        key={g}
                        id={`glance-${g.toLowerCase()}`}
                        type="button"
                        onClick={() => update('glance', g)}
                        className={cn(
                          'px-3 py-1.5 rounded-sm border text-xs sm:text-sm font-body font-medium transition-all text-center cursor-pointer',
                          spirit.glance === g
                            ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] font-semibold shadow-xs'
                            : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                        )}
                        aria-pressed={spirit.glance === g}
                      >
                        {translateGlance(g, language)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tasting Additions Stacked directly underneath Glance */}
                <div className="border-t border-[#D4C3A3] pt-3 flex flex-col gap-1.5">
                  <FieldLabel>{t('tastingAdditions')}</FieldLabel>
                  <div className="grid grid-cols-1 gap-1 mt-0.5">
                    {/* 1. Water / Wasser */}
                    <button
                      id="tasting-addition-water-btn"
                      type="button"
                      onClick={() => update('addedWater', !spirit.addedWater)}
                      className={cn(
                        'px-3 py-1.5 rounded-sm border text-xs sm:text-sm font-body font-medium transition-all text-center cursor-pointer',
                        spirit.addedWater
                          ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] font-semibold shadow-xs'
                          : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                      )}
                      aria-pressed={spirit.addedWater ?? false}
                    >
                      {t('addedWaterBtn')}
                    </button>

                    {/* 2. On the Rocks / Auf Eis */}
                    <button
                      id="tasting-addition-rocks-btn"
                      type="button"
                      onClick={() => update('onTheRocks', !spirit.onTheRocks)}
                      className={cn(
                        'px-3 py-1.5 rounded-sm border text-xs sm:text-sm font-body font-medium transition-all text-center cursor-pointer',
                        spirit.onTheRocks
                          ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] font-semibold shadow-xs'
                          : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                      )}
                      aria-pressed={spirit.onTheRocks ?? false}
                    >
                      {t('onTheRocksBtn')}
                    </button>

                    {/* 3. With Chocolate / Mit Schokolade */}
                    <button
                      id="tasting-addition-chocolate-btn"
                      type="button"
                      onClick={() => update('withChocolate', !spirit.withChocolate)}
                      className={cn(
                        'px-3 py-1.5 rounded-sm border text-xs sm:text-sm font-body font-medium transition-all text-center cursor-pointer',
                        spirit.withChocolate
                          ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] font-semibold shadow-xs'
                          : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                      )}
                      aria-pressed={spirit.withChocolate ?? false}
                    >
                      {t('withChocolateBtn')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Active Flavors & Flavor Profile (Left Column) */}
            <div className="border-t border-[#D4C3A3] pt-4 flex flex-col gap-2 w-full">
              <FieldLabel>{t('activeFlavors')}</FieldLabel>
              <FlavorTagSelector
                spiritId={spirit.id}
                noseFlavorTags={spirit.noseFlavorTags ?? []}
                tasteFlavorTags={spirit.tasteFlavorTags ?? []}
                onNoseTagsChange={(tags) => {
                  update('noseFlavorTags', tags);
                  update('flavorTags', Array.from(new Set([...tags, ...(spirit.tasteFlavorTags ?? [])])));
                }}
                onTasteTagsChange={(tags) => {
                  update('tasteFlavorTags', tags);
                  update('flavorTags', Array.from(new Set([...(spirit.noseFlavorTags ?? []), ...tags])));
                }}
                className="mt-1 w-full"
              />
            </div>

          </div>

          {/* Right Column: Photos, Radar Graph, Nose Sliders & Taste Sliders */}
          <div className="lg:col-span-6 flex flex-col gap-5">

            {/* Spirit Photos Carousel (Top of Right Column) */}
            <div className="flex flex-col gap-2">
              <FieldLabel>{t('spiritPhotos')}</FieldLabel>
              <SpiritPhotoCarousel
                images={spirit.images}
                thumbnailImage={spirit.thumbnailImage}
                onChange={(imgs) => update('images', imgs)}
                onSetThumbnail={(url) => update('thumbnailImage', url as string | undefined)}
              />
            </div>

            {/* Radar Graph (Directly under Photo Carousel) */}
            <div className="flex flex-col gap-2 border-t border-[#D4C3A3] pt-4">
              <div className="flex items-center justify-between">
                <FieldLabel>{t('noseTasteRadar')}</FieldLabel>
              </div>
              <FlavorRadarChart
                noseProfile={spirit.noseProfile}
                tasteProfile={spirit.tasteProfile}
                noseFlavorTags={spirit.noseFlavorTags ?? []}
                tasteFlavorTags={spirit.tasteFlavorTags ?? []}
                noseTagIntensities={spirit.noseTagIntensities ?? {}}
                tasteTagIntensities={spirit.tasteTagIntensities ?? {}}
              />
            </div>

            {/* Dynamic Nose Tag Sliders Section */}
            <div className="border-t border-[#D4C3A3] pt-4">
              <DynamicProfileSliders
                title={t('noseIntensity')}
                type="nose"
                activeTags={spirit.noseFlavorTags ?? []}
                tagIntensities={spirit.noseTagIntensities ?? {}}
                onIntensityChange={(tagName, val) => {
                  const updated = { ...(spirit.noseTagIntensities ?? {}), [tagName]: val };
                  update('noseTagIntensities', updated);
                }}
              />
            </div>

            {/* Dynamic Taste Tag Sliders Section */}
            <div className="border-t border-[#D4C3A3] pt-4">
              <DynamicProfileSliders
                title={t('tasteIntensity')}
                type="taste"
                activeTags={spirit.tasteFlavorTags ?? []}
                tagIntensities={spirit.tasteTagIntensities ?? {}}
                onIntensityChange={(tagName, val) => {
                  const updated = { ...(spirit.tasteTagIntensities ?? {}), [tagName]: val };
                  update('tasteTagIntensities', updated);
                }}
              />
            </div>

          </div>

        </div>

        {/* ── Full-Width Section 2 (100% Row): Finish Length & Finish Notes ───────────── */}
        <section className="border-t border-[#D4C3A3] pt-5 flex flex-col gap-4 w-full" aria-label="Finish">
          <div className="flex items-center justify-between gap-3">
            <FieldLabel>{t('finishLength')}</FieldLabel>
            <div className="flex gap-2">
              {SPIRIT_FINISH_DURATIONS.map((f) => (
                <button
                  key={f}
                  id={`finish-${f.toLowerCase()}`}
                  type="button"
                  onClick={() => update('finish', f)}
                  className={cn(
                    'px-4.5 py-2 rounded-sm border text-xs sm:text-sm font-display uppercase tracking-wider font-semibold transition-all cursor-pointer',
                    spirit.finish === f
                      ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] shadow-xs'
                      : 'border-[#C4A87A] text-[#5c3d22] hover:bg-[#1A120B]/10',
                  )}
                  aria-pressed={spirit.finish === f}
                >
                  {translateFinish(f, language)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <FieldLabel>{t('finishNotes')}</FieldLabel>
            <textarea
              id="finish-notes-textarea"
              value={spirit.finishNotes}
              onChange={(e) => update('finishNotes', e.target.value)}
              rows={3}
              placeholder={t('finishNotesPlaceholder')}
              className={cn(
                'w-full bg-transparent border border-[#C4A87A] rounded-sm p-4',
                'text-sm sm:text-base text-[#1A120B] font-body placeholder:text-[#c4a87a] leading-relaxed',
                'focus:outline-none focus:border-[#5c3d22] resize-none transition-colors',
              )}
            />
          </div>
        </section>

        {/* ── Full-Width Section 3 (100% Row): Score & Rating Section ──── */}
        <section className="border-t border-[#D4C3A3] pt-5 flex flex-col gap-4 w-full" aria-label="Score & Rating Section">
          <FieldLabel>{t('scoreRatingSection')}</FieldLabel>
          <div className="bg-[#1A120B]/5 p-5 rounded border border-[#C4A87A]/60 flex flex-col sm:flex-row items-center justify-between gap-6">
            
            {/* Rating Score & Enlarged Stars */}
            <div className="flex items-center gap-5 w-full sm:w-auto">
              <div className="flex flex-col items-center">
                <FieldLabel>{t('score')}</FieldLabel>
                <span className="font-display text-4xl sm:text-5xl font-bold text-[#1A120B] leading-none mt-1">
                  {spirit.rating100}
                </span>
              </div>
              <div className="flex flex-col gap-1 flex-1 sm:flex-none">
                <RatingStars stars={stars} size={28} />
              </div>
            </div>

            {/* Rating Slider */}
            <div className="flex-1 max-w-md w-full flex items-center gap-3">
              <span className="text-xs sm:text-sm text-[#8c6440] font-body font-semibold">1</span>
              <input
                id="rating-slider"
                type="range"
                min={1}
                max={100}
                value={spirit.rating100}
                onChange={(e) => update('rating100', Number(e.target.value))}
                className="flex-1 accent-[#C59B27] h-[#8c6440] cursor-pointer"
                aria-label="Rating score"
              />
              <span className="text-xs sm:text-sm text-[#8c6440] font-body font-semibold">100</span>
            </div>
          </div>

          {/* Pub Dark Iron & Brass Action Buttons */}
          <div className="flex flex-wrap gap-3.5 justify-end items-center">
            {onDelete && (
              <button
                id="tasting-card-delete"
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className={cn(
                  'flex items-center gap-2 px-5 py-3 rounded-sm border border-red-900/60 bg-red-950/20',
                  'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold text-red-900 hover:bg-red-900 hover:text-white transition-colors cursor-pointer',
                )}
              >
                <Trash2 size={15} />
                {t('deleteTastingNote')}
              </button>
            )}
            <button
              id="tasting-card-reset"
              type="button"
              onClick={handleReset}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-sm border border-[#C4A87A]',
                'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold text-[#5c3d22] hover:bg-[#1A120B] hover:text-[#F5EEDC] hover:border-[#1A120B] transition-colors cursor-pointer',
              )}
            >
              <RotateCcw size={15} />
              {t('reset')}
            </button>
            <button
              id="tasting-card-[#1A120B]"
              type="button"
              onClick={handleSave}
              className={cn(
                'min-w-[180px] flex items-center justify-center gap-2 px-6 py-3 rounded-sm border',
                'text-xs sm:text-sm font-display uppercase tracking-wider font-semibold transition-all duration-200 cursor-pointer',
                saved
                  ? 'bg-green-800 text-white border-green-800'
                  : 'bg-[#1A120B] text-[#F5EEDC] border-[#C59B27] hover:bg-[#2A1B12] hover:border-[#e8c247]',
              )}
            >
              <CheckCircle size={15} />
              {saved ? t('saved') : t('saveTastingNote')}
            </button>
          </div>
        </section>

      </div>

      {/* ── Delete Confirmation Modal Pop-up ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title={t('deleteModalTitle')}
        subtitle={t('deleteModalSubtitle')}
        message={
          <>
            {t('deleteModalMessage')}{' '}
            <strong className="font-semibold text-[#1A120B]">{displayName}</strong>?
          </>
        }
        confirmLabel={t('yesDeleteNote')}
        cancelLabel={t('cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
