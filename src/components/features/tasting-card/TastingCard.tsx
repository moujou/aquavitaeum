'use client';

import React, { useState } from 'react';
import { Spirit } from '@/types/spirit.types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SpiritPhotoCarousel } from '@/components/features/photos/SpiritPhotoCarousel';
import { SpiritScanModal } from '@/components/features/scanner/SpiritScanModal';
import { useTastingCardForm } from '@/hooks/useTastingCardForm';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { TastingHeaderSection } from './sections/TastingHeaderSection';
import { TastingMetadataSection } from './sections/TastingMetadataSection';
import { TastingFlavorSection } from './sections/TastingFlavorSection';
import { TastingFinishSection } from './sections/TastingFinishSection';
import { TastingRatingSection } from './sections/TastingRatingSection';

interface TastingCardProps {
  initialSpirit?: Spirit;
  onSave?: (spirit: Spirit) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function TastingCard({ initialSpirit, onSave, onDelete, className }: TastingCardProps) {
  const { language, t } = useLanguage();
  const {
    spirit,
    showDeleteModal,
    setShowDeleteModal,
    stars,
    displayName,
    subtitleLocation,
    update,
    importSpirit,
    applyScanResult,
    confirmDelete,
  } = useTastingCardForm(initialSpirit, onSave, onDelete);

  const [isHeaderScanModalOpen, setIsHeaderScanModalOpen] = useState(false);

  return (
    <div className={cn('parchment rounded-xl overflow-hidden animate-fade-in shadow-md', className)}>
      
      {/* Section 1: Dynamic Banner Header with Gear Page Actions Dropdown */}
      <TastingHeaderSection
        spirit={spirit}
        displayName={displayName}
        subtitleLocation={subtitleLocation}
        onDelete={onDelete ? () => setShowDeleteModal(true) : undefined}
        onImportSpirit={importSpirit}
        onScanSpirit={() => setIsHeaderScanModalOpen(true)}
        t={t}
      />

      <div className="p-4 sm:p-6 flex flex-col gap-6 sm:gap-8">

        {/* Section 1: Spirit Photos Carousel (Unified Desktop & Mobile) */}
        <div className="flex flex-col gap-2 border-b border-[var(--parchment-border)]/60 pb-5 sm:pb-6">
          <SectionHeader>{t('spiritPhotos')}</SectionHeader>
          <SpiritPhotoCarousel
            images={spirit.images}
            thumbnailImage={spirit.thumbnailImage}
            onChange={(imgs) => update('images', imgs)}
            onSetThumbnail={(url) => update('thumbnailImage', url as string | undefined)}
            onAnalyzeSpirit={applyScanResult}
          />
        </div>

        {/* Section 2: Specifications & Metadata Section */}
        <div className="border-b border-[var(--parchment-border)]/60 pb-6 sm:pb-7">
          <TastingMetadataSection
            spirit={spirit}
            update={update}
            language={language}
            t={t}
          />
        </div>

        {/* Section 3: Dedicated Full-Width Sensory Suite (Tags | Visualizer | Sliders) */}
        <div className="border-b border-[var(--parchment-border)]/60 pb-6 sm:pb-7">
          <TastingFlavorSection
            spirit={spirit}
            update={update}
            onAnalyzeSpirit={applyScanResult}
            t={t}
          />
        </div>

        {/* Full-Width Section 4: Interactive Finish & Notes */}
        <TastingFinishSection
          spirit={spirit}
          update={update}
          t={t}
        />

        {/* Full-Width Section 5: Score & Star Ratings */}
        <TastingRatingSection
          spirit={spirit}
          stars={stars}
          update={update}
          t={t}
        />

      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        title={t('deleteModalTitle')}
        subtitle={t('deleteModalSubtitle')}
        message={
          <>
            {t('deleteModalMessage')}{' '}
            <strong className="font-semibold text-[var(--foreground)]">{displayName}</strong>?
          </>
        }
        confirmLabel={t('yesDeleteNote')}
        cancelLabel={t('cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Header-Triggered Spirit Scan Modal */}
      <SpiritScanModal
        isOpen={isHeaderScanModalOpen}
        onClose={() => setIsHeaderScanModalOpen(false)}
        onApply={(result, uploadedImage, mode) => {
          applyScanResult(result, uploadedImage, mode);
        }}
      />
    </div>
  );
}
