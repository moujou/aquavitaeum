import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpiritScanModal } from '../SpiritScanModal';
import { LanguageProvider } from '@/context/LanguageContext';
import * as aiService from '@/services/ai-assistant-service';

describe('SpiritScanModal Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderModal = (props: Partial<React.ComponentProps<typeof SpiritScanModal>> = {}) => {
    return render(
      <LanguageProvider>
        <SpiritScanModal
          isOpen={true}
          onClose={vi.fn()}
          onApply={vi.fn()}
          {...props}
        />
      </LanguageProvider>
    );
  };

  it('renders modal title and tab switchers when open', () => {
    renderModal();
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(screen.getByRole('button', { name: /Photo|Foto/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Search|Name/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Barcode/i })).toBeDefined();
  });

  it('switches between tabs cleanly', () => {
    renderModal();
    const searchTabBtn = screen.getByRole('button', { name: /Search|Name/i });
    fireEvent.click(searchTabBtn);
    expect(screen.getByTestId('spirit-search-submit-btn')).toBeDefined();

    const barcodeTabBtn = screen.getByRole('button', { name: /Barcode/i });
    fireEvent.click(barcodeTabBtn);
    expect(screen.getByTestId('spirit-barcode-submit-btn')).toBeDefined();
  });

  it('performs text analysis and applies the result', async () => {
    const onApply = vi.fn();
    const mockResult: aiService.SpiritAnalysisResult = {
      name: 'Springbank 10',
      distillery: 'Springbank',
      spiritType: 'Single Malt Scotch',
      region: 'Campbeltown',
      abv: 46,
      characteristics: ['Non-Chill Filtered'],
      barRole: ['Connoisseur Choice'],
    };

    vi.spyOn(aiService, 'analyzeSpiritFromText').mockResolvedValue(mockResult);

    renderModal({ onApply, initialTab: 'text' });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Springbank 10' } });

    const submitBtn = screen.getByTestId('spirit-search-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Springbank 10')).toBeDefined();
    });

    const applyBtn = screen.getByText(/In Notiz übernehmen|Apply to Note/);
    fireEvent.click(applyBtn);

    expect(onApply).toHaveBeenCalledWith(mockResult, undefined, 'facts-only');
  });

  it('handles analysis errors gracefully', async () => {
    vi.spyOn(aiService, 'analyzeSpiritFromText').mockRejectedValue(new Error('Quota reached'));

    renderModal({ initialTab: 'text' });

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Invalid Spirit' } });

    const submitBtn = screen.getByTestId('spirit-search-submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Quota reached/)).toBeDefined();
    });
  });
});
