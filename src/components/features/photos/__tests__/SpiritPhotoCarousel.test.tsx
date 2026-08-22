import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpiritPhotoCarousel } from '../SpiritPhotoCarousel';
import { LanguageProvider } from '@/context/LanguageContext';

describe('SpiritPhotoCarousel Component', () => {
  it('renders empty placeholder state when no images are provided', () => {
    render(
      <LanguageProvider>
        <SpiritPhotoCarousel images={[]} />
      </LanguageProvider>,
    );

    expect(screen.getByText('No Photos Added')).toBeDefined();
    expect(
      screen.getByText('Add bottle label, spirit colour, or tasting setup photos'),
    ).toBeDefined();
    expect(screen.getByRole('button', { name: /Add Photo/i })).toBeDefined();
  });

  it('renders populated carousel when images are present', () => {
    const images = ['data:image/png;base64,img1', 'data:image/png;base64,img2'];
    render(
      <LanguageProvider>
        <SpiritPhotoCarousel images={images} />
      </LanguageProvider>,
    );

    expect(screen.getByAltText('Spirit photo 1')).toBeDefined();
    expect(screen.getByText('1 / 2')).toBeDefined();
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

    const nextBtn = screen.getByRole('button', { name: /Next photo/i });
    fireEvent.click(nextBtn);

    expect(screen.getByAltText('Spirit photo 2')).toBeDefined();
    expect(screen.getByText('2 / 2')).toBeDefined();

    const prevBtn = screen.getByRole('button', { name: /Previous photo/i });
    fireEvent.click(prevBtn);

    expect(screen.getByAltText('Spirit photo 1')).toBeDefined();
    expect(screen.getByText('1 / 2')).toBeDefined();
  });
});
