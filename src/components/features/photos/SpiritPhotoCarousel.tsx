'use client';

import { Camera, ChevronLeft, ChevronRight, Trash2, Plus, Star } from 'lucide-react';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface SpiritPhotoCarouselProps {
  images?: string[];
  thumbnailImage?: string;
  onChange?: (images: string[]) => void;
  onSetThumbnail?: (url: string | undefined) => void;
  className?: string;
}

export function SpiritPhotoCarousel({
  images = [],
  thumbnailImage,
  onChange,
  onSetThumbnail,
  className,
}: SpiritPhotoCarouselProps) {
  const { t } = useLanguage();
  const {
    activeIndex,
    setActiveIndex,
    fileInputRef,
    handleFileUpload,
    handleDelete,
    nextImage,
    prevImage,
  } = usePhotoUpload(images, onChange);

  const safeActiveIndex = activeIndex >= images.length ? Math.max(0, images.length - 1) : activeIndex;
  const currentPhoto = images[safeActiveIndex];
  const isThumbnail = currentPhoto && currentPhoto === thumbnailImage;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        id="spirit-photo-file-input"
      />

      {images.length === 0 ? (
        /* ── Empty State Placeholder ────────────────────────────────────────── */
        <div className="w-full h-96 sm:h-[440px] rounded-md border-2 border-dashed border-[var(--parchment-border)] bg-[var(--sepia-text)]/5 flex flex-col items-center justify-center gap-3.5 p-6 text-center">
          {/* Signature Wine Icon */}
          <div className="w-16 h-16 rounded-full bg-[var(--brass-accent)]/15 border border-[var(--brass-accent)]/40 flex items-center justify-center text-[var(--brass-accent)] shadow-[0_0_20px_rgba(197,155,39,0.15)]">
            <WhiskyLogo size={34} className="text-[var(--brass-accent)]" />
          </div>

          <div className="flex flex-col gap-1 max-w-sm">
            <p className="font-display text-base sm:text-lg font-bold text-[var(--sepia-text)]">
              {t('noPhotosAdded')}
            </p>
            <p className="text-xs sm:text-sm text-[var(--sepia-light)] font-body leading-relaxed">
              {t('addPhotoDesc')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-2 px-4.5 py-2.5 rounded-sm border border-[var(--sepia-muted)]',
              'bg-transparent text-[var(--sepia-text)] text-xs sm:text-sm font-body font-semibold',
              'hover:bg-[var(--parchment-bg-alt)] transition-colors cursor-pointer shadow-xs',
            )}
          >
            <Camera size={16} />
            {t('addPhoto')}
          </button>
        </div>
      ) : (
        /* ── Populated Carousel ───────────────────────────────────────────── */
        <div className="flex flex-col gap-2">
          {/* Main image viewport */}
          <div className="relative w-full h-96 sm:h-[440px] rounded-md border border-[var(--parchment-border)] bg-[var(--sepia-text)] overflow-hidden group">
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[safeActiveIndex]}
              alt={`Spirit photo ${safeActiveIndex + 1}`}
              className="w-full h-full object-contain bg-[var(--sepia-text)]"
            />

            {/* Carousel Navigation Buttons (Left/Right) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--sepia-text)]/70 text-[var(--parchment-bg)] hover:bg-[var(--sepia-text)] flex items-center justify-center border border-[var(--parchment-border)]/40 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--sepia-text)]/70 text-[var(--parchment-bg)] hover:bg-[var(--sepia-text)] flex items-center justify-center border border-[var(--parchment-border)]/40 transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Counter badge */}
            <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-[var(--sepia-text)]/80 border border-[var(--parchment-border)]/50 text-xs font-body text-[var(--parchment-bg)]">
              {safeActiveIndex + 1} / {images.length}
            </div>

            {/* Subtle Cover / Thumbnail Star Icon Button */}
            <button
              id="set-as-thumbnail-btn"
              type="button"
              onClick={() => {
                onSetThumbnail?.(isThumbnail ? undefined : currentPhoto);
              }}
              title={isThumbnail ? t('useAsThumbnailActive') : t('useAsThumbnail')}
              aria-label={isThumbnail ? t('useAsThumbnailActive') : t('useAsThumbnail')}
              className={cn(
                'absolute bottom-2.5 left-2.5 w-8 h-8 rounded-full transition-all border shadow-md flex items-center justify-center cursor-pointer',
                isThumbnail
                  ? 'bg-[var(--brass-accent)] text-[var(--sepia-text)] border-[var(--brass-accent)] shadow-[0_0_10px_rgba(197,155,39,0.4)]'
                  : 'bg-[var(--sepia-text)]/80 text-[var(--parchment-bg)] border-[var(--parchment-border)]/50 hover:border-[var(--brass-accent)] hover:text-[var(--brass-accent)]',
              )}
            >
              <Star size={15} className={isThumbnail ? 'fill-[var(--sepia-text)]' : ''} />
            </button>

            {/* Top right actions: Delete & Add */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleDelete(activeIndex);
                }}
                className="w-8 h-8 rounded-full bg-red-900/80 text-white hover:bg-red-800 flex items-center justify-center border border-red-400/40 transition-colors"
                title={t('deletePhoto')}
                aria-label="Delete photo"
              >
                <Trash2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-full bg-[var(--brass-accent)] text-[var(--sepia-text)] hover:bg-[var(--brass-light)] flex items-center justify-center border border-[var(--brass-accent)] transition-colors"
                title={t('addAnotherPhoto')}
                aria-label="Add photo"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>

          {/* Thumbnails & indicators bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'w-11 h-11 rounded border overflow-hidden transition-all flex-shrink-0 cursor-pointer relative',
                    idx === activeIndex
                      ? 'border-[var(--brass-accent)] ring-1 ring-[var(--brass-accent)]'
                      : 'border-[var(--parchment-border)]/60 opacity-60 hover:opacity-100',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  {img === thumbnailImage && (
                    <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[var(--brass-accent)] border border-[var(--sepia-text)] flex items-center justify-center">
                      <Star size={7} className="fill-[var(--sepia-text)] text-[var(--sepia-text)]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-body font-semibold text-[var(--sepia-light)] hover:text-[var(--sepia-text)] flex items-center gap-1 cursor-pointer whitespace-nowrap ml-2"
            >
              <Plus size={13} /> {t('addPhoto')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
