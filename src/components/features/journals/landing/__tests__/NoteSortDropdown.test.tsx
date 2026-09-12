import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteSortDropdown } from '../NoteSortDropdown';
import { LanguageProvider } from '@/context/LanguageContext';
import { NoteSortOption } from '@/types/spirit.types';

describe('NoteSortDropdown Component', () => {
  it('renders trigger button with current sort option label', () => {
    render(
      <LanguageProvider>
        <NoteSortDropdown value="date_desc" onChange={vi.fn()} />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Sort|Sortieren/i });
    expect(trigger).toBeDefined();
    expect(screen.getByText(/Last Tasted|Zuletzt verkostet/i)).toBeDefined();
  });

  it('opens floating dropdown on click and allows selecting a sort option', () => {
    const handleChange = vi.fn();
    render(
      <LanguageProvider>
        <NoteSortDropdown value="date_desc" onChange={handleChange} />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Sort|Sortieren/i });
    fireEvent.click(trigger);

    const ratingOption = screen.getByText(/Highest Rating|Höchste Bewertung/i);
    expect(ratingOption).toBeDefined();

    fireEvent.click(ratingOption);
    expect(handleChange).toHaveBeenCalledWith('rating_desc' as NoteSortOption);
  });

  it('closes dropdown when pressing Escape key', () => {
    render(
      <LanguageProvider>
        <NoteSortDropdown value="date_desc" onChange={vi.fn()} />
      </LanguageProvider>
    );

    const trigger = screen.getByRole('button', { name: /Sort|Sortieren/i });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeDefined();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
