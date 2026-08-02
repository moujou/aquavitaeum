'use client';

import { useLanguage } from '@/context/LanguageContext';
import { TranslationKey } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

// ─── Category Data ────────────────────────────────────────────────────────────

interface FlavorCategory {
  id: string;
  translationKey: TranslationKey;
  emoji: string;
  tags: string[];
}

const FLAVOR_CATEGORIES: FlavorCategory[] = [
  {
    id: 'peat-smoke',
    translationKey: 'cat_peat_smoke',
    emoji: '🪵',
    tags: ['Peat Smoke', 'Wood Smoke', 'Campfire', 'Medicinal / Iodine', 'Tar', 'Ash', 'Charcoal'],
  },
  {
    id: 'cask-wood',
    translationKey: 'cat_cask_wood',
    emoji: '🍷',
    tags: ['Bourbon Barrel', 'Sherry Cask', 'Port Wine', 'Rum Cask', 'Toasted Oak', 'Charred Wood', 'Spicy Oak'],
  },
  {
    id: 'fruity-floral',
    translationKey: 'cat_fruity_floral',
    emoji: '🍎',
    tags: ['Green Apple', 'Pear', 'Banana', 'Citrus Peel', 'Dried Fig', 'Raisin', 'Peach', 'Fresh Blossom', 'Lavender', 'Rose'],
  },
  {
    id: 'sweetness-bakery',
    translationKey: 'cat_sweetness_bakery',
    emoji: '🍯',
    tags: ['Honey', 'Vanilla', 'Caramel', 'Toffee', 'Dark Chocolate', 'Butterscotch', 'Maple Syrup', 'Marzipan'],
  },
  {
    id: 'cereal-grain',
    translationKey: 'cat_cereal_grain',
    emoji: '🌾',
    tags: ['Malted Barley', 'Wort', 'Cereal', 'Toast', 'Biscuit', 'Coffee', 'Cocoa'],
  },
  {
    id: 'nutty-oily',
    translationKey: 'cat_nutty_oily',
    emoji: '🌰',
    tags: ['Walnut', 'Almond', 'Hazelnut', 'Creamy Butter', 'Linseed Oil'],
  },
  {
    id: 'herbal-botanical',
    translationKey: 'cat_herbal_botanical',
    emoji: '🌿',
    tags: ['Garden Herbs', 'Black Pepper', 'Cinnamon', 'Clove', 'Dried Tobacco', 'Leather', 'Juniper', 'Lemongrass'],
  },
  {
    id: 'maritime-mineral',
    translationKey: 'cat_maritime_mineral',
    emoji: '🌊',
    tags: ['Sea Salt', 'Seaweed', 'Damp Earth', 'Metallic', 'Mineral', 'Brine'],
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface FlavorTagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FlavorTagSelector({
  selectedTags,
  onChange,
  className,
}: FlavorTagSelectorProps) {
  const { t } = useLanguage();

  const toggle = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onChange(next);
  };

  return (
    <div className={cn('flex flex-col gap-3.5', className)}>
      {FLAVOR_CATEGORIES.map((category) => (
        <div key={category.id} className="flex flex-col gap-1.5">
          {/* Category Header with Enlarged Pub Typography */}
          <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-[#a07d1a]">
            {category.emoji} {t(category.translationKey)}
          </p>

          {/* Unified Pub Theme Tag Chips (Warm Oak Mahogany active background for soft contrast) */}
          <div className="flex flex-wrap gap-1.5">
            {category.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  id={`flavor-tag-${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={cn(
                    'px-2.5 py-1 rounded-sm border text-xs sm:text-[13px] font-medium font-body transition-colors duration-150 cursor-pointer select-none',
                    isSelected
                      ? 'bg-[#3D2616] border-[#C59B27] text-[#F5EEDC] shadow-xs'
                      : 'bg-[#1A120B]/5 border-[#C4A87A]/60 text-[#5c3d22] hover:bg-[#1A120B]/15 hover:border-[#C59B27]',
                  )}
                  aria-pressed={isSelected}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Active tags summary */}
      {selectedTags.length > 0 && (
        <div className="mt-1 pt-3 border-t border-[#C4A87A]">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#5c3d22] mb-1">
            {t('activeFlavorsSummary')} ({selectedTags.length})
          </p>
          <p className="text-xs sm:text-sm text-[#1A120B] font-body italic leading-relaxed">
            {selectedTags.join(' · ')}
          </p>
        </div>
      )}
    </div>
  );
}
