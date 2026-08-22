import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpiritPhotoCarousel } from '../SpiritPhotoCarousel';
import { LanguageProvider } from '@/context/LanguageContext';

describe('SpiritPhotoCarousel Component', () => {
  it('renders empty placeholder state with AI button when key is configured', () => {
    localStorage.setItem('aqua_gemini_api_key', 'test_key');
    render(
      <LanguageProvider>
        <SpiritPhotoCarousel images={[]} />
      </LanguageProvider>,
    );

    expect(screen.getByText('No Photos Added')).toBeDefined();
    expect(
      screen.getByText(/Snap the label for automatic identification|Knipse das Etikett/i),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /Analyze & Snap|Flasche analysieren/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Add Photo|Foto/i })).toBeDefined();
  });

  it('renders empty placeholder state without AI button when no key is configured', () => {
    localStorage.clear();
    render(
      <LanguageProvider>
        <SpiritPhotoCarousel images={[]} />
      </LanguageProvider>,
    );

    expect(screen.getByText('No Photos Added')).toBeDefined();
    expect(screen.queryByRole('button', { name: /Analyze & Snap|Flasche analysieren/i })).toBeNull();
    expect(screen.getByRole('button', { name: /Add Photo|Foto/i })).toBeDefined();
  });

  it('renders populated carousel when images are present and shows re-analyze button if key exists', () => {
    localStorage.setItem('aqua_gemini_api_key', 'test_key');
    const images = ['data:image/png;base64,img1', 'data:image/png;base64,img2'];
    render(
      <LanguageProvider>
        <SpiritPhotoCarousel images={images} />
      </LanguageProvider>,
    );

    expect(screen.getByAltText('Spirit photo 1')).toBeDefined();
    expect(screen.getByText('1 / 2')).toBeDefined();
    expect(screen.getAllByRole('button', { name: /Re-analyze|Neu analysieren/i }).length).toBeGreaterThan(0);
  });

  it('triggers onSetThumbnail with image URL when Set Cover is clicked', () => {
    const handleSetThumbnail = vi.fn();
    const images = ['data:image/png;base64,img1', 'data:image/png;base64,img2'];

    render(
      <LanguageProvider>
        <SpiritPhotoCarousel
          images={images}
          thumbnailImage={undefined}
          onSetThumbnail={handleSetThumbnail}
        />
      </LanguageProvider>,
    );

    const setCoverBtn = screen.getByRole('button', { name: /Set Cover|Als Cover/i });
    fireEvent.click(setCoverBtn);

    expect(handleSetThumbnail).toHaveBeenCalledWith('data:image/png;base64,img1');
  });

  it('triggers onSetThumbnail with undefined when clicking active cover button again', () => {
    const handleSetThumbnail = vi.fn();
    const images = ['data:image/png;base64,img1'];

    render(
      <LanguageProvider>
        <SpiritPhotoCarousel
          images={images}
          thumbnailImage="data:image/png;base64,img1"
          onSetThumbnail={handleSetThumbnail}
        />
      </LanguageProvider>,
    );

    const activeCoverBtn = screen.getByRole('button', { name: /^Cover$/i });
    fireEvent.click(activeCoverBtn);

    expect(handleSetThumbnail).toHaveBeenCalledWith(undefined);
  });

  it('triggers onChange with remaining images when delete button is clicked', () => {
    const handleChange = vi.fn();
    const images = ['data:image/png;base64,img1', 'data:image/png;base64,img2'];

    render(
      <LanguageProvider>
        <SpiritPhotoCarousel
          images={images}
          onChange={handleChange}
        />
      </LanguageProvider>,
    );

    const deleteBtn = screen.getByRole('button', { name: /Delete photo/i });
    fireEvent.click(deleteBtn);

    expect(handleChange).toHaveBeenCalledWith(['data:image/png;base64,img2']);
  });

  it('allows navigating between photos with chevrons', () => {
    const images = ['data:image/png;base64,img1', 'data:image/png;base64,img2'];

    render(
      <LanguageProvider>
        <SpiritPhotoCarousel images={images} />
      </LanguageProvider>,
    );

    expect(screen.getByAltText('Spirit photo 1')).toBeDefined();

    const nextBtn = screen.getByRole('button', { name: /Next photo/i });
    fireEvent.click(nextBtn);

    expect(screen.getByAltText('Spirit photo 2')).toBeDefined();
  });
});
