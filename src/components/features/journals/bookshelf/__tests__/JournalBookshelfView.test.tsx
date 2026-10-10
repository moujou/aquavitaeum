import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JournalBookshelfView, getSpinePalette } from '../JournalBookshelfView';
import { JournalWithStats } from '@/hooks/useJournals';
import { LanguageProvider } from '@/context/LanguageContext';

const createMockJournals = (count: number): JournalWithStats[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `journal-${i + 1}`,
    name: i === 0 ? 'Extremely Long Book Title That Will Wrap Into Multiple Lines' : `Whisky Journal Vol. ${i + 1}`,
    description: `Description ${i + 1}`,
    bottleCount: i * 3 + 1,
    averageRating: 85 + (i % 10),
    latestTastedDate: '2026-01-01',
    latestSpiritName: `Spirit ${i + 1}`,
    recentSpirits: [],
    topDrams: [],
    topScore: 90,
    regionCount: 2,
    distilleryCount: 2,
    recentImages: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  }));
};

describe('JournalBookshelfView', () => {
  it('renders all book titles in a responsive grid with max 3 books per row on desktop', () => {
    const journals = createMockJournals(9);
    const onCardClick = vi.fn();

    const { container } = render(
      <LanguageProvider>
        <JournalBookshelfView
          journals={journals}
          selectedIds={new Set()}
          isSelectMode={false}
          editingId={null}
          onCardClick={onCardClick}
          onTouchStart={vi.fn()}
          onTouchEnd={vi.fn()}
          onCancelLongPress={vi.fn()}
          onStartEdit={vi.fn()}
          onStartDelete={vi.fn()}
        />
      </LanguageProvider>
    );

    // Should render 9 books
    expect(screen.getByText('Extremely Long Book Title That Will Wrap Into Multiple Lines')).toBeDefined();
    expect(screen.getByText('Whisky Journal Vol. 2')).toBeDefined();
    expect(screen.getByText('Whisky Journal Vol. 9')).toBeDefined();

    // Responsive grid with max 3 on desktop
    const gridEl = container.querySelector('.grid');
    expect(gridEl?.className).toContain('lg:grid-cols-3');

    // Faux wooden shelf planks are eliminated
    const shelfPlanks = container.querySelectorAll('[class*="shelf-wood-top"]');
    expect(shelfPlanks.length).toBe(0);

    // Clicking a book fires onCardClick
    fireEvent.click(screen.getByText('Whisky Journal Vol. 2'));
    expect(onCardClick).toHaveBeenCalledWith('journal-2', false);
  });

  it('renders long title with max 2 rows wrapping and supports user-selected color', () => {
    const journals = createMockJournals(8);
    journals[1].color = 'ruby';

    const { container } = render(
      <LanguageProvider>
        <JournalBookshelfView
          journals={journals}
          selectedIds={new Set()}
          isSelectMode={false}
          editingId={null}
          onCardClick={vi.fn()}
          onTouchStart={vi.fn()}
          onTouchEnd={vi.fn()}
          onCancelLongPress={vi.fn()}
          onStartEdit={vi.fn()}
          onStartDelete={vi.fn()}
        />
      </LanguageProvider>
    );

    const titleEl = screen.getByText('Extremely Long Book Title That Will Wrap Into Multiple Lines');
    expect(titleEl.className).toContain('break-words');
    expect(titleEl.className).toContain('line-clamp-2');
    expect(titleEl.className).toContain('font-display');

    // Ruby spine is rendered for journal 2
    const rubySpines = container.querySelectorAll('[class*="bg-[var(--spine-ruby)]"]');
    expect(rubySpines.length).toBeGreaterThan(0);

    // Ensure zero white spine palettes exist
    const whiteSpines = container.querySelectorAll('[class*="bg-white"], [class*="bg-[#fff]"]');
    expect(whiteSpines.length).toBe(0);
  });

  it('keeps book colors strictly fixed and invariant across sorting / reordering', () => {
    const journals = createMockJournals(5);
    const target = journals[2];
    const paletteBefore = getSpinePalette(target);

    // Reverse list (simulating sort Z-A)
    const reversed = [...journals].reverse();
    const targetInReversed = reversed.find((j) => j.id === target.id)!;
    const paletteAfter = getSpinePalette(targetInReversed);

    expect(paletteAfter.key).toBe(paletteBefore.key);
  });

  it('atomically separates sommelier rating score and bottle note count into distinct elements', () => {
    const journals = createMockJournals(1);
    journals[0].averageRating = 93;
    journals[0].bottleCount = 14;

    render(
      <LanguageProvider>
        <JournalBookshelfView
          journals={journals}
          selectedIds={new Set()}
          isSelectMode={false}
          editingId={null}
          onCardClick={vi.fn()}
          onTouchStart={vi.fn()}
          onTouchEnd={vi.fn()}
          onCancelLongPress={vi.fn()}
          onStartEdit={vi.fn()}
          onStartDelete={vi.fn()}
        />
      </LanguageProvider>
    );

    // Score element is rendered with 93
    const scoreText = screen.getByText('93');
    expect(scoreText).toBeDefined();

    // Bottle count is rendered with 14
    const countText = screen.getByText('14');
    expect(countText).toBeDefined();

    // They do not share the same immediate parent element (atomic separation)
    expect(scoreText.parentElement).not.toBe(countText.parentElement);
  });
});

