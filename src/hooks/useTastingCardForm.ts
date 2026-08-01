import { useState, useCallback } from 'react';
import { Spirit, FlavorProfile } from '@/types/spirit.types';
import { createBlankSpirit, deduplicateTags, scoreToStars } from '@/lib/spirit-utils';

export function useTastingCardForm(
  initialSpirit?: Spirit,
  onSave?: (spirit: Spirit) => void,
  onDelete?: (id: string) => void,
) {
  const [spirit, setSpirit] = useState<Spirit>(initialSpirit ?? createBlankSpirit());
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const update = useCallback(<K extends keyof Spirit>(key: K, value: Spirit[K]) => {
    setSpirit((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }, []);

  const updateProfile = useCallback(
    (profile: 'noseProfile' | 'tasteProfile', key: keyof FlavorProfile, value: number) => {
      setSpirit((prev) => ({
        ...prev,
        [profile]: { ...prev[profile], [key]: value },
      }));
      setSaved(false);
    },
    [],
  );

  const handleSave = useCallback(() => {
    const cleaned: Spirit = {
      ...spirit,
      flavorTags: deduplicateTags(spirit.flavorTags),
      starRating: scoreToStars(spirit.rating100),
    };
    onSave?.(cleaned);
    setSaved(true);
  }, [spirit, onSave]);

  const handleReset = useCallback(() => {
    setSpirit(initialSpirit ?? createBlankSpirit());
    setSaved(false);
    setIsEditingTitle(false);
  }, [initialSpirit]);

  const confirmDelete = useCallback(() => {
    setShowDeleteModal(false);
    onDelete?.(spirit.id);
  }, [spirit.id, onDelete]);

  const stars = scoreToStars(spirit.rating100);
  const displayName = spirit.name.trim() || 'Untitled Spirit Note';
  const subtitleLocation =
    [spirit.distillery, spirit.region].filter(Boolean).join(' · ') || 'Tasting Notes';

  return {
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
    updateProfile,
    handleSave,
    handleReset,
    confirmDelete,
  };
}
