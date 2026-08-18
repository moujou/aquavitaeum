import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SommelierScoreSlider } from '../SommelierScoreSlider';
import { LanguageProvider } from '@/context/LanguageContext';

describe('SommelierScoreSlider Component', () => {
  it('renders slider with accessibility role and current score', () => {
    const onChangeFn = vi.fn();
    render(
      <LanguageProvider>
        <SommelierScoreSlider score={88} onChange={onChangeFn} />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider', { name: /sommelier score/i });
    expect(slider).toBeDefined();
    expect(slider.getAttribute('aria-valuenow')).toBe('88');
    expect(slider.getAttribute('aria-valuemin')).toBe('1');
    expect(slider.getAttribute('aria-valuemax')).toBe('100');
  });

  it('supports keyboard navigation (Arrow keys, PageUp/Down, Home/End)', () => {
    const onChangeFn = vi.fn();
    render(
      <LanguageProvider>
        <SommelierScoreSlider score={50} onChange={onChangeFn} />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider', { name: /sommelier score/i });

    // ArrowRight -> +1
    fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(onChangeFn).toHaveBeenCalledWith(51);

    // ArrowLeft -> -1
    fireEvent.keyDown(slider, { key: 'ArrowLeft' });
    expect(onChangeFn).toHaveBeenCalledWith(49);

    // PageUp -> +5
    fireEvent.keyDown(slider, { key: 'PageUp' });
    expect(onChangeFn).toHaveBeenCalledWith(55);

    // PageDown -> -5
    fireEvent.keyDown(slider, { key: 'PageDown' });
    expect(onChangeFn).toHaveBeenCalledWith(45);

    // Home -> 1
    fireEvent.keyDown(slider, { key: 'Home' });
    expect(onChangeFn).toHaveBeenCalledWith(1);

    // End -> 100
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChangeFn).toHaveBeenCalledWith(100);
  });

  it('allows clicking decade milestone buttons directly', () => {
    const onChangeFn = vi.fn();
    render(
      <LanguageProvider>
        <SommelierScoreSlider score={50} onChange={onChangeFn} />
      </LanguageProvider>
    );

    const milestone90 = screen.getByRole('button', { name: '90' });
    expect(milestone90).toBeDefined();
    fireEvent.click(milestone90);
    expect(onChangeFn).toHaveBeenCalledWith(90);
  });
});
