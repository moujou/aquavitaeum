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
    <div className={cn('flex flex-col gap-2.5', className)}>
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
        <div className="w-full h-80 sm:h-[420px] rounded-xl border-2 border-dashed border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/20 flex flex-col items-center justify-center gap-3.5 p-6 text-center shadow-2xs">
          {/* Signature Tasting Glass Icon */}
          <div className="w-16 h-16 rounded-full bg-[var(--wood-dark)]/15 border border-[var(--forest-green)]/40 flex items-center justify-center text-[var(--forest-green)] shadow-[0_0_20px_rgba(35,115,71,0.15)]">
            <WhiskyLogo size={34} className="text-[var(--forest-green)]" />
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
              'flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[var(--forest-green)]/40',
              'bg-[var(--forest-green)]/10 text-[var(--forest-green)] text-xs sm:text-sm font-body font-semibold',
              'hover:bg-[var(--forest-green)]/20 transition-all cursor-pointer shadow-xs active:scale-95',
            )}
          >
            <Camera size={16} />
            {t('addPhoto')}
          </button>
        </div>
      ) : (
        /* ── Populated Carousel ───────────────────────────────────────────── */
        <div className="flex flex-col gap-2.5">
          {/* 1. Pure Unobstructed Main Image Viewport */}
          <div className="relative w-full h-80 sm:h-[420px] rounded-xl border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/50 overflow-hidden group flex items-center justify-center shadow-xs">
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[safeActiveIndex]}
              alt={`Spirit photo ${safeActiveIndex + 1}`}
              className="w-full h-full object-contain select-none"
            />

            {/* Subtle Carousel Navigation Chevrons (Left/Right) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--pub-bg-panel)]/90 text-[var(--sepia-text)] hover:bg-[var(--pub-bg-panel)] hover:scale-105 flex items-center justify-center border border-[var(--parchment-border)] shadow-md transition-all cursor-pointer z-10"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[var(--pub-bg-panel)]/90 text-[var(--sepia-text)] hover:bg-[var(--pub-bg-panel)] hover:scale-105 flex items-center justify-center border border-[var(--parchment-border)] shadow-md transition-all cursor-pointer z-10"
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* 2. Dedicated Atelier Media Control Toolbar (Below Photo) */}
          <div className="flex items-center justify-between gap-2 p-2 sm:p-2.5 rounded-lg bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] shadow-2xs">
            {/* Left: Photo Counter & Cover / Thumbnail Toggle */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-mono font-semibold text-[var(--sepia-muted)] px-2.5 py-1 rounded bg-[var(--pub-bg-alt)]/60 border border-[var(--parchment-border)]/50 shrink-0">
                {safeActiveIndex + 1} / {images.length}
              </span>

              <button
                id="set-as-thumbnail-btn"
                type="button"
                onClick={() => {
                  onSetThumbnail?.(isThumbnail ? undefined : currentPhoto);
                }}
                title={isThumbnail ? t('useAsThumbnailActive') : t('useAsThumbnail')}
                aria-label={isThumbnail ? t('useAsThumbnailActive') : t('useAsThumbnail')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-body font-semibold transition-all border cursor-pointer shrink-0 truncate',
                  isThumbnail
                    ? 'bg-[var(--brass-accent)]/15 border-[var(--brass-accent)] text-[var(--brass-accent)] shadow-2xs'
                    : 'bg-transparent border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:border-[var(--brass-accent)] hover:text-[var(--brass-accent)]',
                )}
              >
                <Star size={13} className={isThumbnail ? 'fill-[var(--brass-accent)]' : ''} />
                <span>{isThumbnail ? t('useAsThumbnailActive') : t('useAsThumbnail')}</span>
              </button>
            </div>

            {/* Right: Delete Active Photo & Add New Photo */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleDelete(safeActiveIndex);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-body font-medium text-[var(--sepia-muted)] hover:text-red-700 hover:bg-red-500/10 hover:border-red-300 border border-transparent transition-all cursor-pointer"
                title={t('deletePhoto')}
                aria-label={t('deletePhoto')}
              >
                <Trash2 size={13} />
                <span className="hidden sm:inline">{t('deletePhoto')}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 px-3 py-1 rounded-md text-xs font-body font-semibold bg-[var(--wood-dark)] text-[var(--parchment-bg)] hover:bg-[var(--wood-accent)] transition-all cursor-pointer shadow-2xs active:scale-95"
                title={t('addPhoto')}
                aria-label={t('addPhoto')}
              >
                <Plus size={13} />
                <span>{t('addPhoto')}</span>
              </button>
            </div>
          </div>

          {/* 3. Thumbnails Gallery Strip */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Select photo ${idx + 1}`}
                className={cn(
                  'w-12 h-12 rounded-lg border overflow-hidden transition-all shrink-0 cursor-pointer relative',
                  idx === safeActiveIndex
                    ? 'border-[var(--brass-accent)] ring-2 ring-[var(--brass-accent)]/50 scale-105'
                    : 'border-[var(--parchment-border)]/70 opacity-65 hover:opacity-100 hover:scale-102',
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                {img === thumbnailImage && (
                  <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--brass-accent)] border border-[var(--pub-bg-panel)] flex items-center justify-center shadow-2xs">
                    <Star size={8} className="fill-[var(--sepia-text)] text-[var(--sepia-text)]" />
                  </div>
                )}
              </button>
            ))}

            {/* Quick Add Thumbnail Slot */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('addPhoto')}
              title={t('addPhoto')}
              className="w-12 h-12 rounded-lg border border-dashed border-[var(--parchment-border)] hover:border-[var(--forest-green)] hover:bg-[var(--forest-green)]/10 text-[var(--sepia-muted)] hover:text-[var(--forest-green)] transition-all shrink-0 flex items-center justify-center cursor-pointer shadow-2xs"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
