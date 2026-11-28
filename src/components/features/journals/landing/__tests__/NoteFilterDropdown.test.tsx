import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteFilterDropdown } from '../NoteFilterDropdown';
import { LanguageProvider } from '@/context/LanguageContext';
import { NoteFilterState } from '@/types/spirit.types';

const defaultFilterState: NoteFilterState = {
  minRating: 0,
  minAge: 0,
  characteristics: [],
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
          filterState={{ minRating: 85, minAge: 12, characteristics: ['Cask Strength'] }}
          onChange={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('3')).toBeDefined();
  });

  it('opens panel and allows changing min rating, min age, and characteristics chips', () => {
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
      minRating: 85,
      minAge: 0,
      characteristics: [],
    });

    // Change min age chip (12+)
    const chip12 = screen.getByRole('button', { name: '12+' });
    fireEvent.click(chip12);
    expect(handleChange).toHaveBeenCalledWith({
      minRating: 0,
      minAge: 12,
      characteristics: [],
    });

    // Toggle a characteristic chip (Cask Strength / Fassstärke)
    const caskStrengthChip = screen.getByRole('button', { name: /Cask Strength|Fassstärke/i });
    fireEvent.click(caskStrengthChip);
    expect(handleChange).toHaveBeenCalledWith({
      minRating: 0,
      minAge: 0,
      characteristics: ['Cask Strength'],
    });
  });

  it('allows resetting active filters to default', () => {
    const handleChange = vi.fn();
    render(
      <LanguageProvider>
        <NoteFilterDropdown
          filterState={{ minRating: 90, minAge: 18, characteristics: ['Single Cask'] }}
          onChange={handleChange}
        />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Filter/i });
    fireEvent.click(trigger);

    const resetBtn = screen.getByRole('button', { name: /Reset|Zurücksetzen/i });
    fireEvent.click(resetBtn);

    expect(handleChange).toHaveBeenCalledWith({
      minRating: 0,
      minAge: 0,
      characteristics: [],
    });
  });
});
