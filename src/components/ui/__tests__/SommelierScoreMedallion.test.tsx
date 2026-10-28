import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SommelierScoreMedallion, SCORE_TIERS_CONFIG } from '../SommelierScoreMedallion';
import { LanguageProvider } from '@/context/LanguageContext';

describe('SommelierScoreMedallion', () => {
  it('renders fallback score 1 when score is undefined', () => {
    render(
      <LanguageProvider>
        <SommelierScoreMedallion score={undefined} />
      </LanguageProvider>
    );
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText(/FLAWED|MANGELHAFT/i)).toBeDefined();
  });

  it('renders masterpiece medallion for score 95', () => {
    render(
      <LanguageProvider>
        <SommelierScoreMedallion score={95} size="md" />
      </LanguageProvider>
    );

    expect(screen.getByText('95')).toBeDefined();
    expect(screen.getByText(/MASTERPIECE|MEISTERWERK/i)).toBeDefined();
  });

  it('renders correct tiers for different score brackets', () => {
    const testCases = [
      { score: 92, badge: /MASTERPIECE|MEISTERWERK/i },
      { score: 87, badge: /EXCELLENT|AUSGEZEICHNET/i },
      { score: 82, badge: /VERY GOOD|SEHR GUT/i },
      { score: 75, badge: /GOOD|GUT/i },
      { score: 65, badge: /SOLID|SOLIDE/i },
      { score: 35, badge: /MEDIOCRE|MÄSSIG/i },
      { score: 20, badge: /FLAWED|MANGELHAFT/i },
    ];

    testCases.forEach(({ score, badge }) => {
      const { unmount } = render(
        <LanguageProvider>
          <SommelierScoreMedallion score={score} />
        </LanguageProvider>
      );
      expect(screen.getByText(String(score))).toBeDefined();
      expect(screen.getByText(badge)).toBeDefined();
      unmount();
    });
  });

  it('verifies tier configuration ranges', () => {
    expect(SCORE_TIERS_CONFIG).toHaveLength(7);
    expect(SCORE_TIERS_CONFIG[0].min).toBe(90);
    expect(SCORE_TIERS_CONFIG[0].max).toBe(100);
  });
});
