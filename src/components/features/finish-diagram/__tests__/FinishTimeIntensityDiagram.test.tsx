import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FinishTimeIntensityDiagram } from '../FinishTimeIntensityDiagram';
import { getFlavorColor } from '@/data/spirit-flavor-taxonomy';
import { LanguageProvider } from '@/context/LanguageContext';

describe('FinishTimeIntensityDiagram Component', () => {
  const mockOnChangeCurves = vi.fn();

  it('renders compact persistence scale, lingering flavor chips, and finish character chips', () => {
    const handleSelectFinish = vi.fn();
    const handleFinishChar = vi.fn();

    render(
      <LanguageProvider>
        <FinishTimeIntensityDiagram
          selectedFinish="Medium"
          onSelectFinish={handleSelectFinish}
          finishCharacter={['Warming']}
          onChangeFinishCharacter={handleFinishChar}
          noseFlavorTags={['Peat Smoke']}
          tasteFlavorTags={['Vanilla']}
          onChangeCurves={mockOnChangeCurves}
        />
      </LanguageProvider>
    );

    // Verify Title
    expect(screen.getAllByText(/Finish|Abgang/i).length).toBeGreaterThan(0);

    // Verify compact 4-tier persistence scale buttons
    expect(screen.getByRole('button', { name: /Kurz|< 15s/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Mittel|15–45s/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Lang|45–90s/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Sehr lang|> 90s/i })).toBeDefined();

    // Click "Long" persistence button
    const longBtn = screen.getByRole('button', { name: /Lang|45–90s/i });
    fireEvent.click(longBtn);
    expect(handleSelectFinish).toHaveBeenCalledWith('Long');

    // Verify Lingering Notes Chips
    expect(screen.getByText(/Dominante Noten im Nachklang|Dominant Lingering Notes/i)).toBeDefined();
    expect(screen.getByText(/Peat Smoke/i)).toBeDefined();
    expect(screen.getByText(/Vanilla/i)).toBeDefined();

    // Verify Finish Character & Warmth chips
    const dryChip = screen.getByRole('button', { name: /Dry|Trocken/i });
    expect(dryChip).toBeDefined();
    fireEvent.click(dryChip);
    expect(handleFinishChar).toHaveBeenCalledWith(['Warming', 'Dry']);
  });

  it('toggles lingering aroma prominence on click', () => {
    const handleChangeCurves = vi.fn();

    render(
      <LanguageProvider>
        <FinishTimeIntensityDiagram
          noseFlavorTags={['Peat Smoke']}
          tasteFlavorTags={[]}
          finishCurves={{
            'Peat Smoke': { startTime: 0, peakTime: 8, peakIntensity: 8, endTime: 30 },
          }}
          onChangeCurves={handleChangeCurves}
        />
      </LanguageProvider>
    );

    const peatChip = screen.getByRole('button', { name: /Peat Smoke/i });
    fireEvent.click(peatChip);
    expect(handleChangeCurves).toHaveBeenCalledWith(
      expect.objectContaining({
        'Peat Smoke': expect.objectContaining({
          peakIntensity: 3,
        }),
      })
    );
  });

  it('assigns taxonomy-derived colors correctly for different flavor categories', () => {
    const peatColor = getFlavorColor('Peat Smoke');
    const appleColor = getFlavorColor('Green Apple');
    expect(peatColor).toBe('#655A52'); // Peat Smoke human-instinctive smoky grey-brown
    expect(appleColor).toBe('#3E8E41'); // Green Apple human-instinctive crisp green
  });
});
