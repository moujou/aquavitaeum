import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { LanguageProvider } from '@/context/LanguageContext';
import { SpiritCard } from '../SpiritCard';

describe('Modular SpiritCard Component', () => {
  const sampleSpirit = MOCK_SPIRITS[0];

  it('renders spirit details, region, age, score and ABV with % formatted directly behind the number', () => {
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

    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(clickFn).toHaveBeenCalled();
  });
});
