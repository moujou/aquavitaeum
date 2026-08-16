import { useState, useCallback, useRef, useEffect } from 'react';
import { Spirit, FlavorProfile } from '@/types/spirit.types';
import { createBlankSpirit, deduplicateTags, scoreToStars } from '@/lib/spirit-utils';

export function useTastingCardForm(
  initialSpirit?: Spirit,
  onSave?: (spirit: Spirit) => void,
  onDelete?: (id: string) => void,
) {
  const [spirit, setSpirit] = useState<Spirit>(initialSpirit ?? createBlankSpirit());
  const [saved, setSaved] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingSpiritRef = useRef<Spirit | null>(null);
  const onSaveRef = useRef(onSave);
  const prevSpiritIdRef = useRef<string | null>(initialSpirit?.id ?? null);

  // Keep onSave callback reference updated dynamically
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Sync state and flush old modifications if initialSpirit changes (e.g. user selected different card)
  useEffect(() => {
    if (initialSpirit) {
      const isDifferentSpirit = prevSpiritIdRef.current !== initialSpirit.id;

      if (isDifferentSpirit) {
        // Flush pending changes of the previous spirit
        if (pendingSpiritRef.current) {
          const cleaned: Spirit = {
            ...pendingSpiritRef.current,
            flavorTags: deduplicateTags(pendingSpiritRef.current.flavorTags),
            starRating: scoreToStars(pendingSpiritRef.current.rating100),
          };
          onSaveRef.current?.(cleaned);
        }
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        pendingSpiritRef.current = null;
        setSpirit(initialSpirit);
        setSaved(true);
        prevSpiritIdRef.current = initialSpirit.id;
      } else {
        // Same spirit: Only overwrite local state with parent changes if there are no local unsaved edits
        if (!pendingSpiritRef.current) {
          setSpirit(initialSpirit);
          setSaved(true);
        }
      }
    }
  }, [initialSpirit]);

  // Save instantly on unmount if there are pending changes
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (pendingSpiritRef.current) {
        const cleaned: Spirit = {
          ...pendingSpiritRef.current,
          flavorTags: deduplicateTags(pendingSpiritRef.current.flavorTags),
          starRating: scoreToStars(pendingSpiritRef.current.rating100),
        };
        onSaveRef.current?.(cleaned);
      }
    };
  }, []); // True unmount only

  const triggerSave = useCallback((updatedSpirit: Spirit) => {
    pendingSpiritRef.current = updatedSpirit;
    setSaved(false);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (pendingSpiritRef.current) {
        const cleaned: Spirit = {
          ...pendingSpiritRef.current,
          flavorTags: deduplicateTags(pendingSpiritRef.current.flavorTags),
          starRating: scoreToStars(pendingSpiritRef.current.rating100),
        };
        onSave?.(cleaned);
        setSaved(true);
        pendingSpiritRef.current = null;
      }
    }, 1000);
  }, [onSave]);

  const update = useCallback(<K extends keyof Spirit>(key: K, value: Spirit[K]) => {
    setSpirit((prev) => {
      const nextSpirit = { ...prev, [key]: value };

      // Auto-thumbnail logic
      if (key === 'images') {
        const imgs = value as string[];
        if (imgs.length > 0) {
          if (!prev.thumbnailImage || !imgs.includes(prev.thumbnailImage)) {
            nextSpirit.thumbnailImage = imgs[0];
          }
        } else {
          nextSpirit.thumbnailImage = undefined;
        }
      }

      triggerSave(nextSpirit);
      return nextSpirit;
    });
    setSaved(false);
  }, [triggerSave]);

  const updateProfile = useCallback(
    (profile: 'noseProfile' | 'tasteProfile', key: keyof FlavorProfile, value: number) => {
      setSpirit((prev) => {
        const nextSpirit = {
          ...prev,
          [profile]: { ...prev[profile], [key]: value },
        };
        triggerSave(nextSpirit);
        return nextSpirit;
      });
      setSaved(false);
    },
    [triggerSave],
  );

  const handleSave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const cleaned: Spirit = {
      ...spirit,
      flavorTags: deduplicateTags(spirit.flavorTags),
      starRating: scoreToStars(spirit.rating100),
    };
    onSave?.(cleaned);
    setSaved(true);
    pendingSpiritRef.current = null;
  }, [spirit, onSave]);

  const handleReset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setSpirit(initialSpirit ?? createBlankSpirit());
    setSaved(true);
    setIsEditingTitle(false);
    pendingSpiritRef.current = null;
  }, [initialSpirit]);

  const confirmDelete = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setShowDeleteModal(false);
    onDelete?.(spirit.id);
    pendingSpiritRef.current = null;
  }, [spirit.id, onDelete]);

  const importSpirit = useCallback((imported: Spirit) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    const merged: Spirit = {
      ...imported,
      id: spirit.id, // Preserve current card ID
      journalId: spirit.journalId, // Preserve current journal ID
      updatedAt: new Date().toISOString(),
    };
    setSpirit(merged);
    onSave?.(merged);
    setSaved(true);
    pendingSpiritRef.current = null;
  }, [spirit.id, spirit.journalId, onSave]);

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
    importSpirit,
    handleSave,
    handleReset,
    confirmDelete,
  };
}
