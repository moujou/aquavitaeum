'use client';

import React, { useState } from 'react';
import { CustomFlavorDescriptor, FlavorProfile } from '@/types/spirit.types';
import { RADAR_DIMENSION_COLORS } from '@/data/spirit-flavor-taxonomy';
import { DIMENSIONS } from '@/components/features/radar-chart/FlavorRadarChart';
import { useLanguage } from '@/context/LanguageContext';
import { translateRadarDimension } from '@/lib/i18n/translations';
import { X, Sparkles, Check, Pipette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomFlavorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (flavor: CustomFlavorDescriptor) => void;
  initialName?: string;
}

const EMOJI_QUICK_PICKS = [
  // Fire, Smoke, Peat & Heat
  '🔥', '💨', '⚡', '🌶️', '🫚', '🪵', '🪨', '🌋',
  // Earth, Forest, Leather & Cask Wood
  '👞', '🍂', '🍄', '🌲', '🌳', '🌿', '🌱', '🌾', '☕', '🍫', '🕯️',
  // Maritime, Water & Mineral
  '🌊', '💧', '🧂', '🦪', '⚓',
  // Orchard, Stone Fruit & Citrus
  '🍏', '🍎', '🍐', '🍑', '🍒', '🍋', '🍊', '🍈', '🍇', '🍷', '🥃',
  // Berries & Tropical
  '🍓', '🫐', '🥭', '🍍', '🥥', '🥝', '🍌', '🍉', '🥑', '🫒',
  // Sweets, Honey, Cereal & Dairy
  '🍯', '🍬', '🍮', '🍦', '🍨', '🍩', '🍪', '🍰', '🧁', '🥧', '🥞', '🧈', '🥜', '🌰', '🍞', '🥖', '🥐', '🥨', '🧀',
  // Meaty & Savory
  '🥩', '🥓',
  // Floral & Botanicals
  '🌸', '🌹', '🌺', '🌻', '🪻', '🌼',
];

const COLOR_SWATCHES = [
  { label: 'Flame Smoke', value: '#E65100' },
  { label: 'Crimson Berry', value: '#D81B60' },
  { label: 'Warm Amber', value: '#F57C00' },
  { label: 'Golden Honey', value: '#C59B27' },
  { label: 'Clover Green', value: '#2E945D' },
  { label: 'Forest Olive', value: '#558B2F' },
  { label: 'Coastal Teal', value: '#00796B' },
  { label: 'Lavender', value: '#8E24AA' },
  { label: 'Burgundy', value: '#880E4F' },
  { label: 'Dark Cocoa', value: '#3E2723' },
  { label: 'Toasted Oak', value: '#6D4C41' },
  { label: 'Smoke Slate', value: '#4F565C' },
];

export function CustomFlavorModal({
  isOpen,
  onClose,
  onSave,
  initialName = '',
}: CustomFlavorModalProps) {
  if (!isOpen) return null;

  return (
    <CustomFlavorDialog
      key={initialName}
      onClose={onClose}
      onSave={onSave}
      initialName={initialName}
    />
  );
}

function CustomFlavorDialog({
  onClose,
  onSave,
  initialName = '',
}: {
  onClose: () => void;
  onSave: (flavor: CustomFlavorDescriptor) => void;
  initialName?: string;
}) {
  const { language, t } = useLanguage();
  const [name, setName] = useState(initialName);
  const [emoji, setEmoji] = useState('🍎');
  const [selectedDimension, setSelectedDimension] = useState<keyof FlavorProfile>('fruity');
  const [customColor, setCustomColor] = useState<string | null>(null);

  const activeColor = customColor || RADAR_DIMENSION_COLORS[selectedDimension] || '#C59B27';

  const handleDimensionSelect = (dim: keyof FlavorProfile) => {
    setSelectedDimension(dim);
    setCustomColor(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    const id = `custom_${trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${Date.now().toString(36)}`;
    const customDesc: CustomFlavorDescriptor = {
      id,
      name: trimmed,
      emoji: emoji.trim() || undefined,
      radarDimension: selectedDimension,
      color: activeColor,
    };

    onSave(customDesc);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[var(--parchment-bg)] border border-[var(--parchment-border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-[var(--wood-dark)] to-[var(--wood-selection)] text-white border-b border-black/10 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-200" />
            <h3 className="font-display font-bold text-lg sm:text-xl tracking-wide text-white drop-shadow-xs">
              {t('createCustomFlavorTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Responsive Layout on Desktop */}
        <form onSubmit={handleSave} className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column (md:col-span-6): Name, Category & Color */}
            <div className="md:col-span-6 flex flex-col gap-5">
              {/* 1. Flavor Name Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {t('flavorNameLabel')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('flavorNamePlaceholder')}
                  className="w-full bg-white/70 dark:bg-black/20 border border-[var(--parchment-border)] rounded-lg px-3.5 py-2.5 text-sm sm:text-base font-body text-[var(--foreground)] focus:outline-none focus:border-[var(--wood-selection)] placeholder:text-[var(--parchment-border)] transition-colors shadow-inner"
                  required
                />
              </div>

              {/* 2. Category / Flavor Wheel Axis */}
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[var(--foreground)]">
                  {t('flavorDimensionLabel')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto p-1.5 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40">
                  {DIMENSIONS.map(({ key }) => {
                    const isDimActive = selectedDimension === key;
                    const dimColor = RADAR_DIMENSION_COLORS[key] ?? '#C59B27';

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleDimensionSelect(key)}
                        className={cn(
                          'px-2.5 py-2 rounded-lg border text-xs sm:text-sm font-body font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-left',
                          isDimActive
                            ? 'border-transparent text-white shadow-xs scale-[1.02]'
                            : 'border-[var(--parchment-border)]/60 bg-white/50 dark:bg-black/20 text-[var(--foreground)] hover:bg-white/90'
                        )}
                        style={{
                          backgroundColor: isDimActive ? dimColor : undefined,
                        }}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/20"
                          style={{ backgroundColor: dimColor }}
                        />
                        <span className="truncate">{translateRadarDimension(key, language)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Color Picker */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {t('flavorColorLabel')}
                  </label>
                  {customColor && (
                    <button
                      type="button"
                      onClick={() => setCustomColor(null)}
                      className="text-xs text-[var(--wood-selection)] hover:underline font-body cursor-pointer font-semibold"
                    >
                      {t('defaultCategoryColor')} ↺
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap p-2.5 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40">
                  {COLOR_SWATCHES.map((swatch) => {
                    const isSelected = activeColor.toLowerCase() === swatch.value.toLowerCase();

                    return (
                      <button
                        key={swatch.value}
                        type="button"
                        onClick={() => setCustomColor(swatch.value)}
                        title={swatch.label}
                        className={cn(
                          'w-7 h-7 rounded-full border transition-all cursor-pointer relative flex items-center justify-center',
                          isSelected
                            ? 'border-white ring-2 ring-[var(--wood-selection)] scale-110 shadow-sm'
                            : 'border-black/20 hover:scale-110 opacity-85 hover:opacity-100'
                        )}
                        style={{ backgroundColor: swatch.value }}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white shadow-xs" />}
                      </button>
                    );
                  })}

                  {/* Free Custom Color Pipette */}
                  <label
                    title={t('customColor')}
                    className="w-7 h-7 rounded-full border border-dashed border-[var(--parchment-border)] bg-white/70 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative overflow-hidden"
                  >
                    <Pipette className="w-3.5 h-3.5 text-[var(--sepia-text)] pointer-events-none" />
                    <input
                      type="color"
                      value={activeColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column (md:col-span-6): Emoji Palette & Live Large Preview */}
            <div className="md:col-span-6 flex flex-col gap-5">
              {/* 4. Emoji Icon Palette */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-display font-bold uppercase tracking-wider text-[var(--foreground)]">
                    {t('flavorEmojiLabel')}
                  </label>
                  <span className="text-xs text-[var(--sepia-muted)] font-mono font-semibold">
                    {EMOJI_QUICK_PICKS.length} Icons
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    maxLength={4}
                    className="w-14 h-12 text-center text-2xl bg-white/70 dark:bg-black/20 border-2 border-[var(--wood-selection)] rounded-xl focus:outline-none shadow-sm shrink-0"
                  />
                  <div className="flex flex-wrap gap-1.5 items-center max-h-48 overflow-y-auto p-2 bg-black/5 rounded-xl border border-[var(--parchment-border)]/40 w-full">
                    {EMOJI_QUICK_PICKS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEmoji(em)}
                        className={cn(
                          'w-8 h-8 text-base rounded-lg flex items-center justify-center transition-all cursor-pointer select-none',
                          emoji === em
                            ? 'bg-[var(--wood-selection)] text-white scale-110 shadow-sm'
                            : 'hover:bg-black/10 hover:scale-105'
                        )}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. Live Centered Large Chip Preview */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[var(--parchment-divider)]">
                <span className="text-[11px] font-display uppercase tracking-widest text-[var(--sepia-muted)] font-bold text-center">
                  Vorschau / Live Preview
                </span>
                <div className="flex items-center justify-center p-5 rounded-xl bg-black/5 border border-dashed border-[var(--parchment-border)]">
                  <div
                    className="px-5 py-2 rounded-full text-white text-sm sm:text-base font-body font-bold flex items-center gap-2.5 shadow-md transition-all scale-105"
                    style={{ backgroundColor: activeColor }}
                  >
                    <span className="text-lg">{emoji || '🍎'}</span>
                    <span>{name.trim() || 'Aroma Name'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--parchment-divider)] shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[var(--parchment-border)] text-xs sm:text-sm font-display uppercase tracking-wider font-semibold text-[var(--sepia-text)] hover:bg-black/5 transition-colors cursor-pointer"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className={cn(
                'px-6 py-2 rounded-lg bg-[var(--wood-selection)] text-white text-xs sm:text-sm font-display uppercase tracking-wider font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer',
                !name.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              <Check className="w-4 h-4" />
              <span>{t('saveAndAddFlavor')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
