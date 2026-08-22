import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { LanguageProvider } from '@/context/LanguageContext';
import { NoteListItem } from '../NoteListItem';

describe('NoteListItem Component', () => {
  const sampleSpirit = MOCK_SPIRITS[0];

  it('renders spirit name, distillery, score medallion, and editorial specs cleanly', () => {
    const clickFn = vi.fn();

    render(
      <LanguageProvider>
        <NoteListItem
          spirit={sampleSpirit}
          isSelected={false}
          onClick={clickFn}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Laphroaig')).toBeDefined();
    expect(screen.getByText('10 Year Old Original Cask Strength')).toBeDefined();
    expect(screen.getByText('Islay')).toBeDefined();
    expect(screen.getByText('10 Years')).toBeDefined();
    expect(screen.getByText('40% vol')).toBeDefined();

    // Verify Medallion Score and Star Rating
    expect(screen.getByText('92')).toBeDefined();
    expect(screen.getByLabelText(/Star rating: 4.5 of 5/i)).toBeDefined();

    // Verify click
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(clickFn).toHaveBeenCalled();
  });

  it('supports select mode and renders checkmark when selected', () => {
    const clickFn = vi.fn();

    render(
      <LanguageProvider>
        <NoteListItem
          spirit={sampleSpirit}
          isSelectMode={true}
          isSelected={true}
          onClick={clickFn}
        />
      </LanguageProvider>
    );

    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });
});
