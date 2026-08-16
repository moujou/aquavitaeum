import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Spirit, SpiritType } from '@/types/spirit.types';
import { createBlankSpirit } from '@/lib/spirit-utils';
import { translateColour, translateGlance } from '@/lib/i18n/translations';
import { db } from '@/lib/db';
import { MOCK_SPIRITS } from '@/data/mock-spirits';

export function useSpiritCollection(activeJournalId: string | null) {
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pendingSelectedIdRef = useRef<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpiritType | 'All'>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to sync local database state to server API endpoint (for development fallback)
  const syncWithServer = useCallback(async () => {
    try {
      const allSpirits = await db.spirits.toArray();
      await fetch('/api/spirits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spirits: allSpirits }),
      });
    } catch (err) {
      console.warn('Aqua Vitaeum: Background server API sync failed, relying on local database cache.', err);
    }
  }, []);

  // Fetch spirits for the active journal
  useEffect(() => {
    let isMounted = true;
    if (!activeJournalId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    const journalId = activeJournalId;

    async function loadSpirits() {
      setIsLoading(true);
      let localSpirits: Spirit[] = [];
      try {
        localSpirits = await db.spirits.where('journalId').equals(journalId).toArray();
      } catch (err) {
        console.warn('Aqua Vitaeum: Failed to load spirits from IndexedDB.', err);
      }

      // If local database has no spirits for this journal AND it's the default journal, 
      // seed directly from MOCK_SPIRITS
      if (localSpirits.length === 0 && journalId === 'default-compendium') {
        const seeded = MOCK_SPIRITS.map((s: Spirit) => ({
          ...s,
          journalId: 'default-compendium',
        }));
        if (isMounted) {
          setSpirits(seeded);
          setSelectedId(seeded[0]?.id ?? null);
          setIsLoading(false);
        }
        try {
          await db.spirits.bulkPut(seeded);
        } catch (err) {
          console.warn('Aqua Vitaeum: Could not seed IndexedDB from MOCK_SPIRITS.', err);
        }
        return;
      }

      if (isMounted) {
        // Sort spirits by tasted date (newest first)
        localSpirits.sort((a, b) => (b.dateTasted || '').localeCompare(a.dateTasted || ''));
        setSpirits(localSpirits);
        const targetId = pendingSelectedIdRef.current;
        if (targetId && localSpirits.some((s) => s.id === targetId)) {
          setSelectedId(targetId);
        } else {
          setSelectedId((prev) =>
            prev && localSpirits.some((s) => s.id === prev) ? prev : (localSpirits[0]?.id ?? null)
          );
        }
        pendingSelectedIdRef.current = null;
        setIsLoading(false);
      }
    }

    loadSpirits();
    return () => {
      isMounted = false;
    };
  }, [activeJournalId]);

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
  }, []);

  const handleNewNote = useCallback(async () => {
    if (!activeJournalId) return;
    const blank = createBlankSpirit(activeJournalId);
    try {
      await db.spirits.add(blank);
      setSpirits((prev) => [blank, ...prev]);
      setSelectedId(blank.id);
      await syncWithServer();
    } catch (err) {
      console.error('Aqua Vitaeum: Failed to create new note.', err);
    }
  }, [activeJournalId, syncWithServer]);

  const handleSave = useCallback(
    async (updated: Spirit) => {
      try {
        await db.spirits.put(updated);
        setSpirits((prev) =>
          prev.some((s) => s.id === updated.id)
            ? prev.map((s) => (s.id === updated.id ? updated : s))
            : [updated, ...prev]
        );
        setSelectedId(updated.id);
        await syncWithServer();
      } catch (err) {
        console.error('Aqua Vitaeum: Failed to save note.', err);
      }
    },
    [syncWithServer]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await db.spirits.delete(id);
        setSpirits((prev) => {
          const next = prev.filter((s) => s.id !== id);
          setSelectedId((currentId) => {
            if (currentId === id) {
              return next[0]?.id ?? null;
            }
            return currentId;
          });
          return next;
        });
        await syncWithServer();
      } catch (err) {
        console.error('Aqua Vitaeum: Failed to delete note.', err);
      }
    },
    [syncWithServer]
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
