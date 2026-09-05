import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  FlavorRadarChart,
  DynamicProfileSliders,
  computeRadarDimensionScore,
  getPrecisionRoundedPolygonPath,
  CANONICAL_RADAR_CATEGORIES,
} from '../FlavorRadarChart';
import { WhiskyAromaWheel } from '../WhiskyAromaWheel';
import { LanguageProvider } from '@/context/LanguageContext';
import { DEFAULT_FLAVOR_PROFILE } from '@/lib/spirit-utils';

describe('FlavorRadarChart & DynamicProfileSliders Component Unit Tests', () => {
  it('has exactly 9 canonical radar categories matching taxonomy', () => {
    expect(CANONICAL_RADAR_CATEGORIES).toHaveLength(9);
    expect(CANONICAL_RADAR_CATEGORIES.map((c) => c.key)).toEqual([
      'fruity',
      'winey',
      'cereal',
      'woody',
      'spicy',
      'floral',
      'sulphury',
      'peaty',
      'feinty',
    ]);
  });

  it('correctly calculates radar dimension score as arithmetic average from active tag intensities', () => {
    // Single tag: Peat Smoke (8) -> 8
    const singleScore = computeRadarDimensionScore(
      'peaty',
      ['Peat Smoke'],
      { 'Peat Smoke': 8 },
    );
    expect(singleScore).toBe(8);

    // Tag with intensity 1 -> score 1
    const oneScore = computeRadarDimensionScore(
      'peaty',
      ['Peat Smoke'],
      { 'Peat Smoke': 1 },
      'torf'
    );
    expect(oneScore).toBe(1);

    // Descriptor like Espresso in Woody (holzig) category
    const espressoScore = computeRadarDimensionScore(
      'woody',
      ['Espresso'],
      { Espresso: 8 },
      'holzig'
    );
    expect(espressoScore).toBe(8);
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

  it('renders category-grouped dynamic sliders for active Nose tags and handles individual intensity changes', () => {
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
    expect(screen.getByText('Fruity, Tropical & Citrus')).toBeDefined();
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

  it('renders Standalone Flavor Visualizer with toggle between Aroma Wheel and Radar Chart', () => {
    render(
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

    // Initial view mode is Radar Chart (Default)
    expect(screen.getByText('Aroma Wheel')).toBeDefined();
    expect(screen.getByText('Radar Chart')).toBeDefined();

    // Toggle to Aroma Wheel
    const wheelBtn = screen.getByText('Aroma Wheel');
    fireEvent.click(wheelBtn);
    expect(screen.getByText('Aroma')).toBeDefined();
    expect(screen.getByText(/Ø 7\.0/)).toBeDefined();
    expect(screen.getByText('2 Notes')).toBeDefined();

    // Toggle back to Radar Chart
    const radarBtn = screen.getByText('Radar Chart');
    fireEvent.click(radarBtn);

    // In Radar Mode, interactive legend cards and inspector are present
    expect(screen.getByTitle('Peat & Smoke')).toBeDefined();
    const peatBtnInRadar = screen.getByTitle('Peat & Smoke');
    fireEvent.click(peatBtnInRadar);
    expect(screen.getByText('Peat Smoke')).toBeDefined();

    // Toggle sensory filters
    const noseFilterBtn = screen.getByText('Nose');
    fireEvent.click(noseFilterBtn);
    expect(screen.getByText('Nose')).toBeDefined();
  });

  it('renders WhiskyAromaWheel component with active tags, stats and scores', () => {
    const onSelectTag = vi.fn();
    render(
      <LanguageProvider>
        <WhiskyAromaWheel
          noseFlavorTags={['Peat Smoke']}
          tasteFlavorTags={['Sea Salt']}
          noseTagIntensities={{ 'Peat Smoke': 9 }}
          tasteTagIntensities={{ 'Sea Salt': 7 }}
          sensoryMode="both"
          onSelectTag={onSelectTag}
        />
      </LanguageProvider>
    );

    expect(screen.getByText('Aroma')).toBeDefined();
    expect(screen.getByText(/Ø 8\.0/)).toBeDefined();
    expect(screen.getByText('2 Notes')).toBeDefined();
    expect(screen.getByText('Peat & Smoke')).toBeDefined();
    expect(screen.getByText('Maritime & Mineral')).toBeDefined();
  });

  it('renders streamlined Sommelier Inspector for category and descriptor selection with flowing pill wrap', () => {
    const onSelectTag = vi.fn();
    render(
      <LanguageProvider>
        <WhiskyAromaWheel
          noseFlavorTags={['Peat Smoke', 'Campfire']}
          tasteFlavorTags={[]}
          noseTagIntensities={{ 'Peat Smoke': 9, Campfire: 7 }}
          sensoryMode="both"
          onSelectTag={onSelectTag}
        />
      </LanguageProvider>
    );

    // 1. Click Category (Peat & Smoke) in legend card grid
    const peatLegendBtn = screen.getByTitle('Peat & Smoke');
    fireEvent.click(peatLegendBtn);

    // Inspector should show category name and both notes with intensities
    expect(screen.getAllByText('Peat & Smoke').length).toBeGreaterThan(0);
    expect(screen.getByText('Peat Smoke')).toBeDefined();
    expect(screen.getByText('Campfire')).toBeDefined();

    // 2. Click a specific note (Peat Smoke)
    const peatSmokeBtn = screen.getByText('Peat Smoke');
    fireEvent.click(peatSmokeBtn);
    expect(onSelectTag).toHaveBeenCalledWith('Peat Smoke');

    // Breadcrumb header and active pills should show active note and score
    expect(screen.getAllByText(/\/10/).length).toBeGreaterThan(0);
    expect(screen.getByText('Campfire')).toBeDefined();

    // 3. Click Clear selection button
    const clearBtn = screen.getByTitle('Clear selection');
    fireEvent.click(clearBtn);
    expect(screen.getByText(/Tap or hover over any segment/i)).toBeDefined();

    // 4. Click Category again to select, then click it a second time to toggle off
    fireEvent.click(peatLegendBtn);
    expect(screen.getByTitle('Clear selection')).toBeDefined();
    fireEvent.click(peatLegendBtn);
    expect(screen.getByText(/Tap or hover over any segment/i)).toBeDefined();
  });

  it('generates precision-rounded linear polygon paths with 100% data fidelity for 3+ points and lines for 2 points', () => {
    const points3 = [
      { x: 100, y: 50 },
      { x: 150, y: 120 },
      { x: 50, y: 120 },
    ];
    const path3 = getPrecisionRoundedPolygonPath(points3, 6);
    expect(path3).toContain('M ');
    expect(path3).toContain(' L ');
    expect(path3).toContain(' Q ');
    expect(path3.endsWith(' Z')).toBe(true);

    const points2 = [
      { x: 100, y: 50 },
      { x: 150, y: 120 },
    ];
    const linePath = getPrecisionRoundedPolygonPath(points2);
    expect(linePath).toBe('M 100,50 L 150,120');

    expect(getPrecisionRoundedPolygonPath([])).toBe('');
  });
});

