import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteFilterDropdown } from '../NoteFilterDropdown';
import { LanguageProvider } from '@/context/LanguageContext';
import { NoteFilterState } from '@/types/spirit.types';

const defaultFilterState: NoteFilterState = {
  spiritType: 'All',
  minRating: 0,
};

describe('NoteFilterDropdown Component', () => {
  it('renders trigger button in inactive state when no filters are set', () => {
    render(
      <LanguageProvider>
        <NoteFilterDropdown
          filterState={defaultFilterState}
          onChange={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /Filter/i })).toBeDefined();
    expect(screen.queryByText('1')).toBeNull();
  });

  it('shows badge counter when filters are active', () => {
    render(
      <LanguageProvider>
        <NoteFilterDropdown
          filterState={{ spiritType: 'Single Malt Scotch', minRating: 85 }}
          onChange={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('2')).toBeDefined();
  });

  it('opens panel and allows changing spirit category and min rating', () => {
    const handleChange = vi.fn();
    render(
      <LanguageProvider>
        <NoteFilterDropdown
          filterState={defaultFilterState}
          onChange={handleChange}
        />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(trigger);

    // Change rating threshold chip (85+)
    const chip85 = screen.getByRole('button', { name: '85+' });
    fireEvent.click(chip85);
    expect(handleChange).toHaveBeenCalledWith({
      spiritType: 'All',
      minRating: 85,
    });
  });

  it('allows resetting active filters to default', () => {
    const handleChange = vi.fn();
    render(
      <LanguageProvider>
        <NoteFilterDropdown
          filterState={{ spiritType: 'Bourbon', minRating: 90 }}
          onChange={handleChange}
        />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(trigger);

    const resetBtn = screen.getByRole('button', { name: /Reset Filters|Filter zurücksetzen/i });
    fireEvent.click(resetBtn);

    expect(handleChange).toHaveBeenCalledWith({
      spiritType: 'All',
      minRating: 0,
    });
  });
});
