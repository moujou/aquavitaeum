'use client';

import { useState } from 'react';
import { Spirit } from '@/types/spirit.types';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SpiritPhotoCarousel } from '@/components/features/photos/SpiritPhotoCarousel';
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
    saved,
    showDeleteModal,
    setShowDeleteModal,
    isEditingTitle,
    setIsEditingTitle,
    stars,
    displayName,
    subtitleLocation,
    update,
    handleSave,
    handleReset,
    confirmDelete,
  } = useTastingCardForm(initialSpirit, onSave, onDelete);

  const [finishViewMode, setFinishViewMode] = useState<'simple' | 'advanced'>('simple');

  return (
    <div className={cn('parchment rounded-lg overflow-hidden animate-fade-in', className)}>
      
      {/* Section 1: Dynamic Banner Header */}
      <TastingHeaderSection
        spirit={spirit}
        displayName={displayName}
        subtitleLocation={subtitleLocation}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        update={update}
      />

      <div className="p-6 flex flex-col gap-6">

        {/* Mobile-Only Spirit Photos Section (< lg screens) */}
        <div className="flex lg:hidden flex-col gap-2 border-b border-[#D4C3A3] pb-5">
          <SectionHeader>{t('spiritPhotos')}</SectionHeader>
          <SpiritPhotoCarousel
            images={spirit.images}
            thumbnailImage={spirit.thumbnailImage}
            onChange={(imgs) => update('images', imgs)}
            onSetThumbnail={(url) => update('thumbnailImage', url as string | undefined)}
          />
        </div>

        {/* Top 2-Column Section: Left Metadata & Right Flavor Visuals */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Metadata Section */}
          <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#D4C3A3] pb-6 lg:pb-0 lg:pr-6">
            <TastingMetadataSection
              spirit={spirit}
              update={update}
              language={language}
              t={t}
            />
          </div>

          {/* Right Column: Flavor Visuals & Sliders Section */}
          <div className="lg:col-span-6">
            <TastingFlavorSection
              spirit={spirit}
              update={update}
              t={t}
            />
          </div>

        </div>

        {/* Full-Width Section 4: Interactive Finish Curve Diagram & Notes */}
        <TastingFinishSection
          spirit={spirit}
          finishViewMode={finishViewMode}
          setFinishViewMode={setFinishViewMode}
          update={update}
          t={t}
        />

        {/* Full-Width Section 5: Score, Star Ratings & Action Buttons */}
        <TastingRatingSection
          spirit={spirit}
          stars={stars}
          saved={saved}
          update={update}
          handleSave={handleSave}
          handleReset={handleReset}
          onDelete={onDelete}
          setShowDeleteModal={setShowDeleteModal}
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
            <strong className="font-semibold text-[#1A120B]">{displayName}</strong>?
          </>
        }
        confirmLabel={t('yesDeleteNote')}
        cancelLabel={t('cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
