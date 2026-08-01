'use client';

import { cn } from '@/lib/utils';

// ─── Category Data ────────────────────────────────────────────────────────────

interface FlavorCategory {
  id: string;
  label: string;
  emoji: string;
  color: string;
  selectedColor: string;
  tags: string[];
}

const FLAVOR_CATEGORIES: FlavorCategory[] = [
  {
    id: 'peat-smoke',
    label: 'Peat & Smoke',
    emoji: '🪵',
    color: 'border-stone-400 text-stone-700 hover:bg-stone-200',
    selectedColor: 'bg-stone-600 border-stone-600 text-white',
    tags: ['Peat Smoke', 'Wood Smoke', 'Campfire', 'Medicinal / Iodine', 'Tar', 'Ash', 'Charcoal'],
  },
  {
    id: 'cask-wood',
    label: 'Cask & Wood',
    emoji: '🍷',
    color: 'border-rose-400 text-rose-800 hover:bg-rose-50',
    selectedColor: 'bg-rose-700 border-rose-700 text-white',
    tags: ['Bourbon Barrel', 'Sherry Cask', 'Port Wine', 'Rum Cask', 'Toasted Oak', 'Charred Wood', 'Spicy Oak'],
  },
  {
    id: 'fruity-floral',
    label: 'Fruity & Floral',
    emoji: '🍎',
    color: 'border-pink-400 text-pink-800 hover:bg-pink-50',
    selectedColor: 'bg-pink-600 border-pink-600 text-white',
    tags: ['Green Apple', 'Pear', 'Banana', 'Citrus Peel', 'Dried Fig', 'Raisin', 'Peach', 'Fresh Blossom', 'Lavender', 'Rose'],
  },
  {
    id: 'sweetness-bakery',
    label: 'Sweetness & Bakery',
    emoji: '🍯',
    color: 'border-amber-500 text-amber-800 hover:bg-amber-50',
    selectedColor: 'bg-amber-600 border-amber-600 text-white',
    tags: ['Honey', 'Vanilla', 'Caramel', 'Toffee', 'Dark Chocolate', 'Butterscotch', 'Maple Syrup', 'Marzipan'],
  },
  {
    id: 'cereal-grain',
    label: 'Cereal & Grain',
    emoji: '🌾',
    color: 'border-yellow-600 text-yellow-900 hover:bg-yellow-50',
    selectedColor: 'bg-yellow-700 border-yellow-700 text-white',
    tags: ['Malted Barley', 'Wort', 'Cereal', 'Toast', 'Biscuit', 'Coffee', 'Cocoa'],
  },
  {
    id: 'nutty-oily',
    label: 'Nutty & Oily',
    emoji: '🌰',
    color: 'border-orange-500 text-orange-900 hover:bg-orange-50',
    selectedColor: 'bg-orange-700 border-orange-700 text-white',
    tags: ['Walnut', 'Almond', 'Hazelnut', 'Creamy Butter', 'Linseed Oil'],
  },
  {
    id: 'herbal-botanical',
    label: 'Herbal & Botanical',
    emoji: '🌿',
    color: 'border-green-600 text-green-900 hover:bg-green-50',
    selectedColor: 'bg-green-700 border-green-700 text-white',
    tags: ['Garden Herbs', 'Black Pepper', 'Cinnamon', 'Clove', 'Dried Tobacco', 'Leather', 'Juniper', 'Lemongrass'],
  },
  {
    id: 'maritime-mineral',
    label: 'Maritime & Mineral',
    emoji: '🌊',
    color: 'border-cyan-600 text-cyan-900 hover:bg-cyan-50',
    selectedColor: 'bg-cyan-700 border-cyan-700 text-white',
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
  const toggle = (tag: string) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    onChange(next);
  };

  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      {FLAVOR_CATEGORIES.map((category) => (
        <div key={category.id}>
          {/* Category header */}
          <p className="font-display text-[10px] font-semibold uppercase tracking-widest text-[#5c3d22] mb-1">
            {category.emoji} {category.label}
          </p>
          {/* Tag chips */}
          <div className="flex flex-wrap gap-1">
            {category.tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  id={`flavor-tag-${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={cn(
                    'px-2 py-0.5 rounded-sm border text-[10px] font-medium',
                    'transition-all duration-150 cursor-pointer select-none',
                    isSelected
                      ? category.selectedColor
                      : category.color,
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
        <div className="mt-1 pt-2.5 border-t border-[#C4A87A]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#5c3d22] mb-0.5">
            Active Flavors ({selectedTags.length})
          </p>
          <p className="text-xs text-[#1A120B] font-body italic leading-relaxed">
            {selectedTags.join(' · ')}
          </p>
        </div>
      )}
    </div>
  );
}
