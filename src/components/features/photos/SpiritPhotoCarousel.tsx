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

  const currentPhoto = images[activeIndex];
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
        <div className="w-full h-96 sm:h-[440px] rounded-md border-2 border-dashed border-[#C4A87A] bg-[#1A120B]/5 flex flex-col items-center justify-center gap-3.5 p-6 text-center">
          {/* Signature Wine Icon */}
          <div className="w-16 h-16 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/40 flex items-center justify-center text-[#C59B27] shadow-[0_0_20px_rgba(197,155,39,0.15)]">
            <WhiskyLogo size={34} className="text-[#C59B27]" />
          </div>

          <div className="flex flex-col gap-1 max-w-sm">
            <p className="font-display text-base sm:text-lg font-bold text-[#1A120B]">
              {t('noPhotosAdded')}
            </p>
            <p className="text-xs sm:text-sm text-[#8c6440] font-body leading-relaxed">
              {t('addPhotoDesc')}
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-2 px-4.5 py-2.5 rounded-sm border border-[#C59B27]',
              'bg-[#1A120B] text-[#F5EEDC] text-xs sm:text-sm font-body font-semibold',
              'hover:bg-[#2A1B12] transition-colors cursor-pointer shadow-sm',
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
          <div className="relative w-full h-96 sm:h-[440px] rounded-md border border-[#C4A87A] bg-[#1A120B] overflow-hidden group">
            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[activeIndex]}
              alt={`Spirit photo ${activeIndex + 1}`}
              className="w-full h-full object-contain bg-[#1A120B]"
            />

            {/* Carousel Navigation Buttons (Left/Right) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1A120B]/70 text-[#F5EEDC] hover:bg-[#1A120B] flex items-center justify-center border border-[#C4A87A]/40 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#1A120B]/70 text-[#F5EEDC] hover:bg-[#1A120B] flex items-center justify-center border border-[#C4A87A]/40 transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Counter badge */}
            <div className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full bg-[#1A120B]/80 border border-[#C4A87A]/50 text-xs font-body text-[#F5EEDC]">
              {activeIndex + 1} / {images.length}
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
                  ? 'bg-[#C59B27] text-[#1A120B] border-[#C59B27] shadow-[0_0_10px_rgba(197,155,39,0.4)]'
                  : 'bg-[#1A120B]/80 text-[#F5EEDC] border-[#C4A87A]/50 hover:border-[#C59B27] hover:text-[#C59B27]',
              )}
            >
              <Star size={15} className={isThumbnail ? 'fill-[#1A120B]' : ''} />
            </button>

            {/* Top right actions: Delete & Add */}
            <div className="absolute top-2.5 right-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (isThumbnail) {
                    onSetThumbnail?.(undefined);
                  }
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
                className="w-8 h-8 rounded-full bg-[#C59B27] text-[#1A120B] hover:bg-[#e8c247] flex items-center justify-center border border-[#C59B27] transition-colors"
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
                      ? 'border-[#C59B27] ring-1 ring-[#C59B27]'
                      : 'border-[#C4A87A]/60 opacity-60 hover:opacity-100',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  {img === thumbnailImage && (
                    <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-[#C59B27] border border-[#1A120B] flex items-center justify-center">
                      <Star size={7} className="fill-[#1A120B] text-[#1A120B]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-body font-semibold text-[#8c6440] hover:text-[#1A120B] flex items-center gap-1 cursor-pointer whitespace-nowrap ml-2"
            >
              <Plus size={13} /> {t('addPhoto')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
