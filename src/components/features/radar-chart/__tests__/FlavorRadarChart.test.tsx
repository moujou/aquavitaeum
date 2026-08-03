import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  FlavorRadarChart,
  DynamicProfileSliders,
  computeRadarDimensionScore,
} from '../FlavorRadarChart';
import { LanguageProvider } from '@/context/LanguageContext';
import { DEFAULT_FLAVOR_PROFILE } from '@/lib/spirit-utils';

describe('FlavorRadarChart & DynamicProfileSliders Component Unit Tests', () => {
  it('correctly calculates radar dimension score from active tag intensities', () => {
    // Active tags under Peaty: Peat Smoke with score 8
    const score = computeRadarDimensionScore(
      'peaty',
      ['Peat Smoke'],
      { 'Peat Smoke': 8 },
    );
    expect(score).toBe(8);
  });

  it('resets radar dimension score to 0 when all tags under that dimension are deleted/deactivated', () => {
    // No active tags under Peaty -> should return 0 for realtime zeroing
    const score = computeRadarDimensionScore(
      'peaty',
      [],
      {},
    );
    expect(score).toBe(0);
  });

  it('renders dynamic sliders for active Nose tags and handles intensity slider changes', () => {
    const handleIntensityChange = vi.fn();

    render(
      <LanguageProvider>
        <DynamicProfileSliders
          title="Nose Intensity"
          type="nose"
          activeTags={['Green Apple', 'Pear']}
          tagIntensities={{ 'Green Apple': 7, Pear: 5 }}
          onIntensityChange={handleIntensityChange}
        />
      </LanguageProvider>,
    );

    expect(screen.getByText('Nose Intensity (2)')).toBeDefined();
    expect(screen.getByText('Green Apple')).toBeDefined();
    expect(screen.getByText('Pear')).toBeDefined();

    const appleSlider = screen.getByLabelText('Nose Intensity Green Apple') as HTMLInputElement;
    expect(appleSlider.value).toBe('7');

    fireEvent.change(appleSlider, { target: { value: '9' } });
    expect(handleIntensityChange).toHaveBeenCalledWith('Green Apple', 9);
  });

  it('shows empty placeholder state when no tags are selected for Nose/Taste sliders', () => {
    const handleIntensityChange = vi.fn();

    render(
      <LanguageProvider>
        <DynamicProfileSliders
          title="Taste Intensity"
          type="taste"
          activeTags={[]}
          tagIntensities={{}}
          onIntensityChange={handleIntensityChange}
        />
      </LanguageProvider>,
    );

    expect(screen.getByText(/Select flavor tags under Taste/i)).toBeDefined();
  });

  it('renders Standalone Flavor Radar Chart without crashing', () => {
    const { container } = render(
      <LanguageProvider>
        <FlavorRadarChart
          noseProfile={DEFAULT_FLAVOR_PROFILE}
          tasteProfile={DEFAULT_FLAVOR_PROFILE}
          noseFlavorTags={['Peat Smoke']}
          tasteFlavorTags={['Vanilla']}
          noseTagIntensities={{ 'Peat Smoke': 8 }}
          tasteTagIntensities={{ Vanilla: 6 }}
        />
      </LanguageProvider>,
    );

    expect(container.firstChild).toBeDefined();
  });
});
