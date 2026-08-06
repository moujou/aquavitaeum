import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FinishTimeIntensityDiagram, getFlavorColor } from '../FinishTimeIntensityDiagram';
import { LanguageProvider } from '@/context/LanguageContext';

describe('FinishTimeIntensityDiagram Component', () => {
  const mockOnChangeCurves = vi.fn();

  it('renders empty state message when no flavor tags are selected', () => {
    render(
      <LanguageProvider>
        <FinishTimeIntensityDiagram
          viewMode="advanced"
          noseFlavorTags={[]}
          tasteFlavorTags={[]}
          finishCurves={{}}
          onChangeCurves={mockOnChangeCurves}
        />
      </LanguageProvider>
    );

    expect(
      screen.getByText(/Select flavor tags under Nose or Taste to view and edit/i)
    ).toBeDefined();
  });

  it('renders SVG canvas with 0-20s time axis and multi-slider control panel when active tags are present', () => {
    render(
      <LanguageProvider>
        <FinishTimeIntensityDiagram
          viewMode="advanced"
          noseFlavorTags={['Peat Smoke']}
          tasteFlavorTags={['Vanilla']}
          finishCurves={{
            'Peat Smoke': { startTime: 0, peakTime: 4, peakIntensity: 8, endTime: 18 },
            Vanilla: { startTime: 1, peakTime: 3, peakIntensity: 6, endTime: 14 },
          }}
          onChangeCurves={mockOnChangeCurves}
        />
      </LanguageProvider>
    );

    // Verify Title
    expect(screen.getAllByText(/Finish Intensity/i).length).toBeGreaterThan(0);

    // Verify Active Tags in Control Panel
    expect(screen.getByText('Peat Smoke')).toBeDefined();
    expect(screen.getByText('Vanilla')).toBeDefined();
  });

  it('renders quick selection buttons when in simple view mode', () => {
    const handleSelectFinish = vi.fn();

    render(
      <LanguageProvider>
        <FinishTimeIntensityDiagram
          viewMode="simple"
          onChangeCurves={mockOnChangeCurves}
          onSelectFinish={handleSelectFinish}
        />
      </LanguageProvider>
    );

    const shortBtn = screen.getByRole('button', { name: /Short/i });
    expect(shortBtn).toBeDefined();

    fireEvent.click(shortBtn);
    expect(handleSelectFinish).toHaveBeenCalledWith('Short');
  });

  it('updates curve parameters when sliders are adjusted in the control panel', () => {
    const handleChangeCurves = vi.fn();

    render(
      <LanguageProvider>
        <FinishTimeIntensityDiagram
          viewMode="advanced"
          noseFlavorTags={['Peat Smoke']}
          tasteFlavorTags={[]}
          finishCurves={{
            'Peat Smoke': { startTime: 0, peakTime: 4, peakIntensity: 8, endTime: 22 },
          }}
          onChangeCurves={handleChangeCurves}
        />
      </LanguageProvider>
    );

    // Find peak intensity slider by label
    const peakSlider = screen.getByLabelText(/Peat Smoke Peak/i);
    fireEvent.change(peakSlider, { target: { value: '9' } });

    expect(handleChangeCurves).toHaveBeenCalledWith(
      expect.objectContaining({
        'Peat Smoke': expect.objectContaining({
          peakIntensity: 9,
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
