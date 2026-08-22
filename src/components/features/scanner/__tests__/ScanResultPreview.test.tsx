import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ScanResultPreview } from '../subcomponents/ScanResultPreview';
import { SpiritAnalysisResult } from '@/services/ai-assistant-service';

const mockResult: SpiritAnalysisResult = {
  name: 'Highland Park 18',
  distillery: 'Highland Park',
  spiritType: 'Single Malt Scotch',
  region: 'Islands / Orkney',
  abv: 43,
  age: 18,
  volumeMl: 700,
  caskTypes: ['Sherry Oak Casks'],
  characteristics: ['Natural Colour'],
  colour: 'Old Gold',
  barRole: ['Connoisseur Choice'],
  suggestedNoseTags: ['Heather Honey', 'Peat Smoke'],
  suggestedTasteTags: ['Dried Fruit', 'Dark Chocolate'],
};

describe('ScanResultPreview', () => {
  it('renders spirit specifications and detected badges', () => {
    render(
      <ScanResultPreview
        language="DE"
        analysisResult={mockResult}
        applyMode="facts-only"
        onApplyModeChange={vi.fn()}
      />
    );

    expect(screen.getByText('Highland Park 18')).toBeDefined();
    expect(screen.getByText(/Islands \/ Orkney/)).toBeDefined();
    expect(screen.getByText('43% vol')).toBeDefined();
    expect(screen.getByText(/Jahre|Years/)).toBeDefined();
    expect(screen.getByText('🪵 Sherry Oak Casks')).toBeDefined();
    expect(screen.getByText('✓ Natural Colour')).toBeDefined();
  });

  it('allows switching between facts-only and full tasting notes modes', () => {
    const onApplyModeChange = vi.fn();
    render(
      <ScanResultPreview
        language="DE"
        analysisResult={mockResult}
        applyMode="facts-only"
        onApplyModeChange={onApplyModeChange}
      />
    );

    const fullOption = screen.getByText('Mit Destillerie-Notizen');
    fireEvent.click(fullOption);
    expect(onApplyModeChange).toHaveBeenCalledWith('full');
  });
});
