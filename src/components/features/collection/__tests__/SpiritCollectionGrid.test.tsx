import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpiritCollectionGrid } from '../SpiritCollectionGrid';
import { Spirit } from '@/types/spirit.types';
import { LanguageProvider } from '@/context/LanguageContext';

const MOCK_SPIRITS: Spirit[] = [
  {
    id: 'spirit-1',
    spiritType: 'Single Malt Scotch',
    distillery: 'Laphroaig',
    name: '10 Year Old',
    region: 'Islay, Scotland',
    age: 10,
    abv: 43,
    dateTasted: '2026-08-01',
    rating100: 92,
    starRating: 4.5,
    colour: 'Amber',
    glance: 'Oily',
    finish: 'Long',
    finishNotes: 'Peat smoke and marine brine',
    noseProfile: {
      fruity: 3,
      floral: 1,
      spicy: 4,
      cereal: 5,
      peaty: 9,
      sulphury: 1,
      feinty: 3,
      nutty: 4,
      woody: 6,
      winey: 2,
      chocolate: 3,
    },
    tasteProfile: {
      fruity: 2,
      floral: 1,
      spicy: 5,
      cereal: 4,
      peaty: 10,
      sulphury: 1,
      feinty: 4,
      nutty: 5,
      woody: 7,
      winey: 2,
      chocolate: 4,
    },
    flavorTags: ['Peat Smoke', 'Sea Salt'],
  },
  {
    id: 'spirit-2',
    spiritType: 'Bourbon',
    distillery: 'Woodford Reserve',
    name: 'Double Oaked',
    region: 'Kentucky, USA',
    abv: 45.2,
    dateTasted: '2026-08-02',
    rating100: 88,
    starRating: 4.4,
    colour: 'Dark Oak',
    glance: 'Creamy',
    finish: 'Medium',
    finishNotes: 'Vanilla and charred oak',
    thumbnailImage: 'data:image/png;base64,mockthumb',
    noseProfile: {
      fruity: 5,
      floral: 2,
      spicy: 6,
      cereal: 4,
      peaty: 0,
      sulphury: 0,
      feinty: 1,
      nutty: 7,
      woody: 9,
      winey: 3,
      chocolate: 8,
    },
    tasteProfile: {
      fruity: 4,
      floral: 1,
      spicy: 7,
      cereal: 5,
      peaty: 0,
      sulphury: 0,
      feinty: 1,
      nutty: 8,
      woody: 9,
      winey: 3,
      chocolate: 9,
    },
    flavorTags: ['Vanilla', 'Dark Chocolate'],
  },
];

describe('SpiritCollectionGrid Component', () => {
  it('renders spirit collection cards with distillery names, spirit names, and scores', () => {
    render(
      <LanguageProvider>
        <SpiritCollectionGrid
          spirits={MOCK_SPIRITS}
          selectedId="spirit-1"
          onSelect={vi.fn()}
          onNewNote={vi.fn()}
        />
      </LanguageProvider>,
    );

    expect(screen.getByText('Laphroaig')).toBeDefined();
    expect(screen.getByText('10 Year Old')).toBeDefined();
    expect(screen.getByText('92')).toBeDefined();

    expect(screen.getByText('Woodford Reserve')).toBeDefined();
    expect(screen.getByText('Double Oaked')).toBeDefined();
    expect(screen.getByText('88')).toBeDefined();
  });

  it('renders photo thumbnail image and vertical color bar when thumbnailImage is set', () => {
    render(
      <LanguageProvider>
        <SpiritCollectionGrid
          spirits={MOCK_SPIRITS}
          selectedId="spirit-2"
          onSelect={vi.fn()}
          onNewNote={vi.fn()}
        />
      </LanguageProvider>,
    );

    const thumbImg = screen.getByAltText('Double Oaked');
    expect(thumbImg).toBeDefined();
    expect(thumbImg.getAttribute('src')).toBe('data:image/png;base64,mockthumb');
  });

  it('filters spirits by search query input', () => {
    render(
      <LanguageProvider>
        <SpiritCollectionGrid
          spirits={MOCK_SPIRITS}
          selectedId="spirit-1"
          onSelect={vi.fn()}
          onNewNote={vi.fn()}
        />
      </LanguageProvider>,
    );

    const searchInput = screen.getByPlaceholderText('Search spirits…');
    fireEvent.change(searchInput, { target: { value: 'Woodford' } });

    expect(screen.queryByText('Laphroaig')).toBeNull();
    expect(screen.getByText('Woodford Reserve')).toBeDefined();
  });

  it('calls onSelect when a spirit card is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <LanguageProvider>
        <SpiritCollectionGrid
          spirits={MOCK_SPIRITS}
          selectedId="spirit-1"
          onSelect={handleSelect}
          onNewNote={vi.fn()}
        />
      </LanguageProvider>,
    );

    const card = screen.getByRole('button', { name: /Woodford Reserve/i });
    fireEvent.click(card);

    expect(handleSelect).toHaveBeenCalledWith(MOCK_SPIRITS[1]);
  });

  it('calls onNewNote when New Note button is clicked', () => {
    const handleNewNote = vi.fn();
    render(
      <LanguageProvider>
        <SpiritCollectionGrid
          spirits={MOCK_SPIRITS}
          selectedId="spirit-1"
          onSelect={vi.fn()}
          onNewNote={handleNewNote}
        />
      </LanguageProvider>,
    );

    const newNoteBtn = screen.getByRole('button', { name: /New Note/i });
    fireEvent.click(newNoteBtn);

    expect(handleNewNote).toHaveBeenCalledTimes(1);
  });
});
