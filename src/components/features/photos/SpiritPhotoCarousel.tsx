'use client';

import React, { useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, Trash2, Plus, Star, Sparkles } from 'lucide-react';
import { WhiskyLogo } from '@/components/ui/WhiskyLogo';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { useLanguage } from '@/context/LanguageContext';
import { useAiAssistantConfig } from '@/hooks/useAiAssistantConfig';
import { SpiritScanModal, SpiritApplyMode } from '@/components/features/scanner/SpiritScanModal';
import { SpiritAnalysisResult } from '@/services/ai-assistant-service';
import { cn } from '@/lib/utils';

interface SpiritPhotoCarouselProps {
  images?: string[];
  thumbnailImage?: string;
  onChange?: (images: string[]) => void;
  onSetThumbnail?: (url: string | undefined) => void;
  onAnalyzeSpirit?: (result: SpiritAnalysisResult, uploadedImage?: string, mode?: SpiritApplyMode) => void;
  className?: string;
}

export function SpiritPhotoCarousel({
  images = [],
  thumbnailImage,
  onChange,
  onSetThumbnail,
  onAnalyzeSpirit,
  className,
}: SpiritPhotoCarouselProps) {
  const { language, t } = useLanguage();
  const { hasAiKey } = useAiAssistantConfig();
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const {
    activeIndex,
    setActiveIndex,
    fileInputRef,
    handleFileUpload,
    handleDelete,
    nextImage,
    prevImage,
  } = usePhotoUpload(images, onChange);

  const isThumbnail = (url: string) => thumbnailImage === url;
  const safeActiveIndex = Math.min(activeIndex, Math.max(0, images.length - 1));
  const currentPhoto = images[safeActiveIndex];

  const handleApplyScan = (result: SpiritAnalysisResult, uploadedImage?: string, mode?: SpiritApplyMode) => {
    if (uploadedImage) {
      const newImages = [...images, uploadedImage];
      onChange?.(newImages);
      if (!thumbnailImage && onSetThumbnail) {
        onSetThumbnail(uploadedImage);
      }
    }
    onAnalyzeSpirit?.(result, uploadedImage, mode);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
        id="spirit-photo-upload"
      />

      {images.length === 0 ? (
        /* ── Empty State Placeholder ────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border border-dashed border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/40 text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[var(--forest-green)]/10 flex items-center justify-center text-[var(--forest-green)]">
            <WhiskyLogo size={28} />
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-[var(--foreground)]">
              {t('noPhotosAdded')}
            </p>
            <p className="font-body text-xs text-[var(--sepia-muted)] mt-0.5">
              {language === 'DE'
                ? hasAiKey
                  ? 'Knipse das Etikett für automatische Erkennung oder lade eigene Fotos hoch.'
                  : 'Füge Fotos deiner Flasche oder des Etiketts hinzu.'
                : hasAiKey
                  ? 'Snap the label for automatic identification or upload your own photos.'
                  : 'Add photos of your bottle or label.'}
            </p>
          </div>

          {/* Action Buttons: 1. AI Scan & Snap (Primary) | 2. Simple Photo Upload (Secondary) */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            {hasAiKey && (
              <button
                type="button"
                onClick={() => setIsScanModalOpen(true)}
                className={cn(
                  'flex items-center gap-2 px-4.5 py-2.5 rounded-lg border border-[var(--brass-accent)]/50',
                  'bg-[var(--wood-dark)] text-white text-xs sm:text-sm font-display font-bold uppercase tracking-wider',
                  'hover:bg-[var(--wood-accent)] transition-all cursor-pointer shadow-md active:scale-95'
                )}
              >
                <Sparkles size={16} className="text-[var(--brass-accent)]" />
                <span>{language === 'DE' ? 'Flasche analysieren & knipsen' : 'Analyze & Snap Bottle'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--parchment-border)]',
                'bg-[var(--pub-bg-panel)] text-[var(--sepia-text)] text-xs sm:text-sm font-body font-medium',
                'hover:bg-[var(--pub-bg-alt)] transition-all cursor-pointer shadow-xs active:scale-95'
              )}
            >
              <Camera size={16} />
              <span>{t('addPhoto')}</span>
            </button>
          </div>
        </div>
      ) : (
        /* ── Populated Carousel ───────────────────────────────────────────── */
        <div className="flex flex-col gap-2.5">
          {/* 1. Pure Unobstructed Main Image Viewport */}
          <div className="relative w-full aspect-[4/3] max-h-64 sm:max-h-80 md:max-h-[420px] rounded-xl border border-[var(--parchment-border)] bg-[var(--pub-bg-alt)]/50 overflow-hidden group flex items-center justify-center shadow-xs">
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

          {/* 2. Dedicated Atelier Media Control Toolbar */}
          <div className="flex items-center justify-between gap-2 p-1.5 sm:p-2 rounded-lg bg-[var(--pub-bg-panel)] border border-[var(--parchment-border)] shadow-2xs">
            {/* Left: Counter, Cover Toggle, AI Assistant & Add Photo */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-xs font-mono font-semibold text-[var(--sepia-muted)] px-2.5 py-1 rounded bg-[var(--pub-bg-alt)]/60 border border-[var(--parchment-border)]/50 shrink-0">
                {safeActiveIndex + 1} / {images.length}
              </span>

              <button
                type="button"
                onClick={() => {
                  onSetThumbnail?.(isThumbnail(currentPhoto) ? undefined : currentPhoto);
                }}
                title={isThumbnail(currentPhoto) ? t('useAsThumbnailActive') : t('useAsThumbnail')}
                aria-label={isThumbnail(currentPhoto) ? t('useAsThumbnailActive') : t('useAsThumbnail')}
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all border cursor-pointer shrink-0 active:scale-95 shadow-2xs',
                  isThumbnail(currentPhoto)
                    ? 'bg-[var(--brass-accent)]/20 border-[var(--brass-accent)] text-[var(--brass-accent)]'
                    : 'bg-transparent border-[var(--parchment-border)] text-[var(--sepia-muted)] hover:border-[var(--brass-accent)] hover:text-[var(--brass-accent)] hover:bg-[var(--pub-bg-alt)]',
                )}
              >
                <Star size={15} className={isThumbnail(currentPhoto) ? 'fill-[var(--brass-accent)]' : ''} />
              </button>

              {/* AI Assistant Button in Clover Green */}
              {hasAiKey && (
                <button
                  type="button"
                  onClick={() => setIsScanModalOpen(true)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--forest-green)]/15 border border-[var(--forest-green)]/40 text-[var(--forest-green)] hover:bg-[var(--forest-green)] hover:text-white transition-all cursor-pointer shadow-2xs active:scale-95"
                  title={language === 'DE' ? 'Cask & Spirit Assistent: Flasche analysieren' : 'Cask & Spirit Assistant: Analyze bottle'}
                  aria-label={language === 'DE' ? 'Flasche neu analysieren' : 'Re-analyze Bottle'}
                >
                  <Sparkles size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-[var(--wood-dark)] text-white hover:bg-[var(--wood-accent)] transition-all cursor-pointer shadow-2xs active:scale-95 border border-[var(--wood-dark)]"
                title={t('addPhoto')}
                aria-label={t('addPhoto')}
              >
                <Plus size={15} />
              </button>
            </div>

            {/* Right: Delete Action */}
            <div className="flex items-center shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleDelete(safeActiveIndex);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--sepia-muted)] hover:text-red-700 hover:bg-red-500/15 hover:border-red-400 border border-[var(--parchment-border)]/60 transition-all cursor-pointer shadow-2xs active:scale-95"
                title={t('deletePhoto')}
                aria-label={t('deletePhoto')}
              >
                <Trash2 size={15} />
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

      {/* Embedded Spirit Scan Modal */}
      <SpiritScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onApply={handleApplyScan}
      />
    </div>
  );
}
