'use client';

import { Camera, ChevronLeft, ChevronRight, Trash2, Plus } from 'lucide-react';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { cn } from '@/lib/utils';

interface SpiritPhotoCarouselProps {
  images?: string[];
  onChange?: (images: string[]) => void;
  className?: string;
}

export function SpiritPhotoCarousel({
  images = [],
  onChange,
  className,
}: SpiritPhotoCarouselProps) {
  const {
    activeIndex,
    setActiveIndex,
    fileInputRef,
    handleFileUpload,
    handleDelete,
    nextImage,
    prevImage,
  } = usePhotoUpload(images, onChange);

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
        <div className="w-full h-80 sm:h-96 rounded-md border-2 border-dashed border-[#C4A87A] bg-[#1A120B]/5 flex flex-col items-center justify-center gap-3 p-4 text-center">
          {/* Vintage Spirit Bottle & Glass SVG */}
          <div className="w-14 h-14 rounded-full bg-[#C59B27]/15 border border-[#C59B27]/40 flex items-center justify-center text-[#C59B27]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              {/* Bottle */}
              <path d="M9 2h6v3l2 3v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V8l2-3V2z" />
              <line x1="9" y1="2" x2="15" y2="2" />
              <line x1="7" y1="12" x2="17" y2="12" />
              {/* Glass */}
              <path d="M19 14l1.5 5.5a1 1 0 0 1-1 1.5H16.5a1 1 0 0 1-1-1.5L17 14" />
            </svg>
          </div>

          <div className="flex flex-col gap-0.5">
            <p className="font-display text-xs font-semibold text-[#1A120B]">
              No Photos Added
            </p>
            <p className="text-[10px] text-[#8c6440] font-body">
              Add bottle label, spirit colour, or tasting setup photos
            </p>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#C59B27]',
              'bg-[#1A120B] text-[#F5EEDC] text-xs font-body font-semibold',
              'hover:bg-[#2A1B12] transition-colors cursor-pointer',
            )}
          >
            <Camera size={13} />
            Add Photo
          </button>
        </div>
      ) : (
        /* ── Populated Carousel ───────────────────────────────────────────── */
        <div className="flex flex-col gap-2">
          {/* Main image viewport */}
          <div className="relative w-full h-80 sm:h-96 rounded-md border border-[#C4A87A] bg-[#1A120B] overflow-hidden group">
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1A120B]/70 text-[#F5EEDC] hover:bg-[#1A120B] flex items-center justify-center border border-[#C4A87A]/40 transition-colors"
                  aria-label="Previous photo"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1A120B]/70 text-[#F5EEDC] hover:bg-[#1A120B] flex items-center justify-center border border-[#C4A87A]/40 transition-colors"
                  aria-label="Next photo"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}

            {/* Counter badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#1A120B]/80 border border-[#C4A87A]/50 text-[10px] font-body text-[#F5EEDC]">
              {activeIndex + 1} / {images.length}
            </div>

            {/* Top right actions: Delete & Add */}
            <div className="absolute top-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDelete(activeIndex)}
                className="w-7 h-7 rounded-full bg-red-900/80 text-white hover:bg-red-800 flex items-center justify-center border border-red-400/40 transition-colors"
                title="Delete photo"
                aria-label="Delete photo"
              >
                <Trash2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded-full bg-[#C59B27] text-[#1A120B] hover:bg-[#e8c247] flex items-center justify-center border border-[#C59B27] transition-colors"
                title="Add another photo"
                aria-label="Add photo"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Thumbnails & indicators bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'w-9 h-9 rounded border overflow-hidden transition-all flex-shrink-0 cursor-pointer',
                    idx === activeIndex
                      ? 'border-[#C59B27] ring-1 ring-[#C59B27]'
                      : 'border-[#C4A87A]/60 opacity-60 hover:opacity-100',
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[11px] font-body font-semibold text-[#8c6440] hover:text-[#1A120B] flex items-center gap-1 cursor-pointer whitespace-nowrap ml-2"
            >
              <Plus size={12} /> Add Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
