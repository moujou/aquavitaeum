import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Spirit, SpiritType } from '@/types/spirit.types';
import { createBlankSpirit } from '@/lib/spirit-utils';
import { translateColour, translateGlance } from '@/lib/i18n/translations';
import { db } from '@/lib/db';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import {
  notifyDataMutated,
  DATA_MUTATED_EVENT,
  REMOTE_SYNC_COMPLETED_EVENT,
} from '@/lib/sync-events';

const SEEDED_STORAGE_KEY = 'aqua-vitaeum-seeded';
const SESSION_SPIRIT_KEY = 'aqua-vitaeum-active-spirit-id';

import { recordTombstone, removeTombstone } from '@/lib/sync-tombstones';

export function useSpiritCollection(activeJournalId: string | null) {
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pendingSelectedIdRef = useRef<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpiritType | 'All'>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch spirits for the active journal
  const loadSpirits = useCallback(async () => {
    if (!activeJournalId) {
      setIsLoading(false);
      return;
    }
    const journalId = activeJournalId;

    let localSpirits: Spirit[] = [];
    try {
      localSpirits = await db.spirits.where('journalId').equals(journalId).toArray();
    } catch (err) {
      console.warn('Aqua Vitaeum: Failed to load spirits from IndexedDB.', err);
    }

    // First-time seed for default compendium directly from MOCK_SPIRITS
    const isAlreadySeeded = typeof window !== 'undefined' && localStorage.getItem(SEEDED_STORAGE_KEY) === 'true';
    if (localSpirits.length === 0 && journalId === 'default-compendium' && !isAlreadySeeded) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(SEEDED_STORAGE_KEY, 'true');
      }
      if (MOCK_SPIRITS.length > 0) {
        const seeded = MOCK_SPIRITS.map((s: Spirit) => ({
          ...s,
          journalId: 'default-compendium',
        }));
        setSpirits(seeded);
        setSelectedId(seeded[0]?.id ?? null);
        setIsLoading(false);
        try {
          await db.spirits.bulkPut(seeded);
        } catch (err) {
          console.warn('Aqua Vitaeum: Could not seed IndexedDB from MOCK_SPIRITS.', err);
        }
        return;
      }
    }

    // Sort spirits by tasted date (newest first)
    localSpirits.sort((a, b) => (b.dateTasted || '').localeCompare(a.dateTasted || ''));
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
    setIsLoading(false);
  }, [activeJournalId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSpirits();
  }, [loadSpirits]);

  // Live reactivity: listen to background sync / import updates / remote sync completions
  useEffect(() => {
    const handleDataChanged = () => {
      loadSpirits();
    };
    window.addEventListener(DATA_MUTATED_EVENT, handleDataChanged);
    window.addEventListener(REMOTE_SYNC_COMPLETED_EVENT, handleDataChanged);
    return () => {
      window.removeEventListener(DATA_MUTATED_EVENT, handleDataChanged);
      window.removeEventListener(REMOTE_SYNC_COMPLETED_EVENT, handleDataChanged);
    };
  }, [loadSpirits]);

  const activeSpirit = useMemo(() => {
    return spirits.find((s) => s.id === selectedId) ?? createBlankSpirit(activeJournalId || undefined);
  }, [spirits, selectedId, activeJournalId]);

  const filteredSpirits = useMemo(() => {
    return spirits.filter((s) => {
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
  }, [spirits, search, typeFilter]);

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
        setSpirits((prev) =>
          prev.some((s) => s.id === spiritToSave.id)
            ? prev.map((s) => (s.id === spiritToSave.id ? spiritToSave : s))
            : [spiritToSave, ...prev]
        );
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
    []
  );

  return {
    spirits,
    filteredSpirits,
    selectedId,
    activeSpirit,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    isLoading,
    selectSpirit,
    handleNewNote,
    handleSave,
    handleDelete,
  };
}
