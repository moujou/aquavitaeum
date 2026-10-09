import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { LanguageProvider } from '@/context/LanguageContext';
import { SpiritCard } from '../SpiritCard';

describe('Modular SpiritCard Component', () => {
  const sampleSpirit = MOCK_SPIRITS[0];

  it('renders spirit details, region, age, score, ABV, tasting quote and category icons', () => {
    const clickFn = vi.fn();

    render(
      <LanguageProvider>
        <SpiritCard
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

    // Verify Sommelier Medallion and Stars in footer
    expect(screen.getByText('92')).toBeDefined();
    expect(screen.getByLabelText(/Star rating: 4.5 of 5/i)).toBeDefined();

    // Verify Tasting Quote Snippet
    expect(screen.getByText(/Ex-Bourbon & Quarter Cask Finish/)).toBeDefined();

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(clickFn).toHaveBeenCalled();
  });

  it('renders independent bottler when distinct from distillery', () => {
    const independentBottling = {
      ...sampleSpirit,
      id: 'ib-test',
      distillery: 'Caol Ila',
      bottler: 'Signatory Vintage',
      region: 'Islay',
    };

    render(
      <LanguageProvider>
        <SpiritCard
          spirit={independentBottling}
          isSelected={false}
          onClick={vi.fn()}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Caol Ila')).toBeDefined();
    expect(screen.getByText('Signatory Vintage')).toBeDefined();
    expect(screen.getByText('Islay')).toBeDefined();
  });
});
