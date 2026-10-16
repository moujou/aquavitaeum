import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Spirit, SpiritType } from '@/types/spirit.types';
import { createBlankSpirit, deduplicateTags } from '@/lib/spirit-utils';
import { translateColour, translateGlance } from '@/lib/i18n/translations';
import { SpiritAnalysisResult } from '@/services/ai-assistant-service';
import { SpiritApplyMode } from '@/components/features/scanner/SpiritScanModal';
import { registerCustomFlavorIfMissing } from '@/data/spirit-flavor-taxonomy';
import { db } from '@/lib/db';
import {
  notifyDataMutated,
  DATA_MUTATED_EVENT,
  REMOTE_SYNC_COMPLETED_EVENT,
} from '@/lib/sync-events';

const SESSION_SPIRIT_KEY = 'aqua-vitaeum-active-spirit-id';

import { recordTombstone, removeTombstone } from '@/lib/sync-tombstones';

const spiritsMemoryCache = new Map<string, Spirit[]>();

export function useSpiritCollection(activeJournalId: string | null) {
  const [spirits, setSpirits] = useState<Spirit[]>(() => {
    return activeJournalId && spiritsMemoryCache.has(activeJournalId)
      ? spiritsMemoryCache.get(activeJournalId)!
      : [];
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pendingSelectedIdRef = useRef<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpiritType | 'All'>('All');
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    return activeJournalId ? !spiritsMemoryCache.has(activeJournalId) : false;
  });
  const [loadedJournalId, setLoadedJournalId] = useState<string | null>(() => {
    return activeJournalId && spiritsMemoryCache.has(activeJournalId) ? activeJournalId : null;
  });
  const loadedJournalIdRef = useRef<string | null>(
    activeJournalId && spiritsMemoryCache.has(activeJournalId) ? activeJournalId : null
  );

  // Synchronously true when activeJournalId has not yet loaded its notes and has no cache
  const isEffectiveLoading = isLoading || (activeJournalId !== null && loadedJournalId !== activeJournalId && !spiritsMemoryCache.has(activeJournalId));
  const effectiveSpirits = useMemo(() => {
    if (activeJournalId !== null && loadedJournalId !== activeJournalId) {
      return spiritsMemoryCache.get(activeJournalId) || [];
    }
    return spirits;
  }, [activeJournalId, loadedJournalId, spirits]);

  // Fetch spirits for the active journal
  const loadSpirits = useCallback(async (isSilent = false) => {
    if (!activeJournalId) {
      setSelectedId(null);
      setIsLoading(false);
      return;
    }
    const journalId = activeJournalId;
    const isCached = spiritsMemoryCache.has(journalId);
    if (!isSilent && !isCached && loadedJournalIdRef.current !== journalId) {
      setIsLoading(true);
    }

    let localSpirits: Spirit[] = [];
    try {
      localSpirits = await db.spirits.where('journalId').equals(journalId).toArray();
    } catch (err) {
      console.warn('Aqua Vitaeum: Failed to load spirits from IndexedDB.', err);
    }

    // Sort spirits by tasted date (newest first)
    localSpirits.sort((a, b) => (b.dateTasted || '').localeCompare(a.dateTasted || ''));
    spiritsMemoryCache.set(journalId, localSpirits);
    setSpirits(localSpirits);
    const targetId =
      pendingSelectedIdRef.current ||
      (typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_SPIRIT_KEY) : null);
    if (targetId && localSpirits.some((s) => s.id === targetId)) {
      setSelectedId(targetId);
    } else {
      setSelectedId((prev) =>
        prev && localSpirits.some((s) => s.id === prev) ? prev : (localSpirits[0]?.id ?? null)
      );
    }
    pendingSelectedIdRef.current = null;
    loadedJournalIdRef.current = journalId;
    setLoadedJournalId(journalId);
    setIsLoading(false);
  }, [activeJournalId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSpirits();
  }, [loadSpirits]);

  // Live reactivity: listen to background sync / import updates / remote sync completions
  useEffect(() => {
    const handleDataChanged = () => {
      loadSpirits(true);
    };
    window.addEventListener(DATA_MUTATED_EVENT, handleDataChanged);
    window.addEventListener(REMOTE_SYNC_COMPLETED_EVENT, handleDataChanged);
    return () => {
      window.removeEventListener(DATA_MUTATED_EVENT, handleDataChanged);
      window.removeEventListener(REMOTE_SYNC_COMPLETED_EVENT, handleDataChanged);
    };
  }, [loadSpirits]);

  const activeSpirit = useMemo(() => {
    return effectiveSpirits.find((s) => s.id === selectedId) ?? createBlankSpirit(activeJournalId || undefined);
  }, [effectiveSpirits, selectedId, activeJournalId]);

  const filteredSpirits = useMemo(() => {
    return effectiveSpirits.filter((s) => {
      const matchesType = typeFilter === 'All' || s.spiritType === typeFilter;
      const q = search.trim().toLowerCase();
      if (!q) return matchesType;

      const glances = Array.isArray(s.glance) ? s.glance : (s.glance ? [s.glance] : []);
      const glanceEN = glances.map((g) => g.toLowerCase()).join(' ');
      const glanceDE = glances.map((g) => translateGlance(g, 'DE').toLowerCase()).join(' ');

      const colourEN = s.colour.toLowerCase();
      const colourDE = translateColour(s.colour, 'DE').toLowerCase();

      const tags = (s.flavorTags || []).join(' ').toLowerCase();
      const finishNotes = (s.finishNotes || '').toLowerCase();
      const caskNo = (s.caskNo || '').toLowerCase();

      const matchesSearch =
        s.distillery.toLowerCase().includes(q) ||
        (s.bottler || '').toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.spiritType.toLowerCase().includes(q) ||
        glanceEN.includes(q) ||
        glanceDE.includes(q) ||
        colourEN.includes(q) ||
        colourDE.includes(q) ||
        caskNo.includes(q) ||
        finishNotes.includes(q) ||
        tags.includes(q);

      return matchesType && matchesSearch;
    });
  }, [effectiveSpirits, search, typeFilter]);

  const selectSpirit = useCallback((id: string) => {
    pendingSelectedIdRef.current = id;
    setSelectedId(id);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_SPIRIT_KEY, id);
    }
  }, []);

  const handleNewNote = useCallback(async () => {
    if (!activeJournalId) return;
    const blank = createBlankSpirit(activeJournalId);
    try {
      await db.spirits.add(blank);
      setSpirits((prev) => [blank, ...prev]);
      setSelectedId(blank.id);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(SESSION_SPIRIT_KEY, blank.id);
      }
      notifyDataMutated();
    } catch (err) {
      console.error('Aqua Vitaeum: Failed to create new note.', err);
    }
  }, [activeJournalId]);

  const handleSave = useCallback(
    async (updated: Spirit) => {
      try {
        const spiritToSave: Spirit = {
          ...updated,
          updatedAt: new Date().toISOString(),
        };
        await db.spirits.put(spiritToSave);
        removeTombstone(spiritToSave.id);
        setSpirits((prev) => {
          const next = prev.some((s) => s.id === spiritToSave.id)
            ? prev.map((s) => (s.id === spiritToSave.id ? spiritToSave : s))
            : [spiritToSave, ...prev];
          if (spiritToSave.journalId) {
            spiritsMemoryCache.set(spiritToSave.journalId, next);
          }
          return next;
        });
        setSelectedId(spiritToSave.id);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_SPIRIT_KEY, spiritToSave.id);
        }
        notifyDataMutated();
      } catch (err) {
        console.error('Aqua Vitaeum: Failed to save spirit locally.', err);
        throw err;
      }
    },
    []
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        recordTombstone(id, 'spirit');
        await db.spirits.delete(id);
        setSpirits((prev) => {
          const next = prev.filter((s) => s.id !== id);
          if (activeJournalId) {
            spiritsMemoryCache.set(activeJournalId, next);
          }
          setSelectedId((currentId) => {
            if (currentId === id) {
              const nextId = next[0]?.id ?? null;
              if (typeof window !== 'undefined') {
                if (nextId) {
                  sessionStorage.setItem(SESSION_SPIRIT_KEY, nextId);
                } else {
                  sessionStorage.removeItem(SESSION_SPIRIT_KEY);
                }
              }
              return nextId;
            }
            return currentId;
          });
          return next;
        });
        notifyDataMutated();
      } catch (err) {
        console.error('Aqua Vitaeum: Failed to delete spirit locally.', err);
        throw err;
      }
    },
    [activeJournalId]
  );

  const handleNewNoteFromScan = useCallback(
    async (result: SpiritAnalysisResult, uploadedImage?: string, mode: SpiritApplyMode = 'facts-only') => {
      if (!activeJournalId) return null;
      const blank = createBlankSpirit(activeJournalId);
      const updatedImages = uploadedImage ? [uploadedImage] : [];
      const updatedThumbnail = uploadedImage;

        const detectedCaskFinish =
          result.caskFinish ||
          (result.caskTypes && result.caskTypes.length > 0 ? result.caskTypes.join(', ') : 'Ex-Bourbon Casks');

        const newSpirit: Spirit = {
          ...blank,
          name: result.name || 'Unknown Spirit',
          distillery: result.distillery || '',
          bottler: result.bottler || '',
          region: result.region || '',
          spiritType: result.spiritType || 'Single Malt Scotch',
          abv: result.abv || 40.0,
          age: result.age !== undefined ? result.age : undefined,
          volumeMl: result.volumeMl ?? 700,
          caskNo: result.caskNo || undefined,
          characteristics:
            result.characteristics && result.characteristics.length > 0
              ? result.characteristics
              : [],
          colour: result.colour || 'Amber',
          glance: result.glance && result.glance.length > 0 ? result.glance : [],
          finish: detectedCaskFinish,
          finishCharacter:
            result.finishCharacter && result.finishCharacter.length > 0
              ? result.finishCharacter
              : [],
          servingNotes: result.servingNotes || '',
          barRole: result.barRole && result.barRole.length > 0 ? result.barRole : [],
          images: updatedImages,
          thumbnailImage: updatedThumbnail,
          updatedAt: new Date().toISOString(),
        };

        if (mode === 'full') {
          if (result.finishNotes || result.finish) {
            newSpirit.finishNotes = result.finishNotes || result.finish || '';
          }
          if (result.suggestedNoseTags && result.suggestedNoseTags.length > 0) {
            result.suggestedNoseTags.forEach((tag) => {
              const dim = result.suggestedNoseTagDimensions?.[tag];
              registerCustomFlavorIfMissing(tag, dim);
            });
            newSpirit.noseFlavorTags = [...result.suggestedNoseTags];
          }
          if (result.suggestedTasteTags && result.suggestedTasteTags.length > 0) {
            result.suggestedTasteTags.forEach((tag) => {
              const dim = result.suggestedTasteTagDimensions?.[tag];
              registerCustomFlavorIfMissing(tag, dim);
            });
            newSpirit.tasteFlavorTags = [...result.suggestedTasteTags];
          }
          if (result.noseTagIntensities && Object.keys(result.noseTagIntensities).length > 0) {
            newSpirit.noseTagIntensities = { ...result.noseTagIntensities };
          }
          if (result.tasteTagIntensities && Object.keys(result.tasteTagIntensities).length > 0) {
            newSpirit.tasteTagIntensities = { ...result.tasteTagIntensities };
          }
          if (result.noseProfile) {
            newSpirit.noseProfile = {
              ...newSpirit.noseProfile,
              ...result.noseProfile,
            };
          }
          if (result.tasteProfile) {
            newSpirit.tasteProfile = {
              ...newSpirit.tasteProfile,
              ...result.tasteProfile,
            };
          }
          newSpirit.flavorTags = deduplicateTags([
            ...(newSpirit.noseFlavorTags ?? []),
            ...(newSpirit.tasteFlavorTags ?? []),
          ]);
        }

      try {
        await db.spirits.add(newSpirit);
        setSpirits((prev) => [newSpirit, ...prev]);
        setSelectedId(newSpirit.id);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(SESSION_SPIRIT_KEY, newSpirit.id);
        }
        notifyDataMutated();
        return newSpirit.id;
      } catch (err) {
        console.error('Aqua Vitaeum: Failed to create new note from scan.', err);
        return null;
      }
    },
    [activeJournalId]
  );

  return {
    spirits: effectiveSpirits,
    filteredSpirits,
    selectedId,
    activeSpirit,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    isLoading: isEffectiveLoading,
    selectSpirit,
    handleNewNote,
    handleNewNoteFromScan,
    handleSave,
    handleDelete,
  };
}
