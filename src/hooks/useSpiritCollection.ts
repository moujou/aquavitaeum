import { useState, useCallback, useMemo, useEffect } from 'react';
import { Spirit, SpiritType } from '@/types/spirit.types';
import { createBlankSpirit } from '@/lib/spirit-utils';
import { translateColour, translateGlance } from '@/lib/i18n/translations';
import { db } from '@/lib/db';

export function useSpiritCollection(initialSpirits: Spirit[] = []) {
  const [spirits, setSpirits] = useState<Spirit[]>(initialSpirits);
  const [selectedId, setSelectedId] = useState<string | null>(initialSpirits[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpiritType | 'All'>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to persist array to IndexedDB and server API endpoint fallback
  const persistSpirits = useCallback(async (updatedList: Spirit[]) => {
    try {
      await db.spirits.clear();
      if (updatedList.length > 0) {
        await db.spirits.bulkPut(updatedList);
      }
    } catch (err) {
      console.warn('Aqua Vitaeum: Failed to persist spirit collection to local database.', err);
    }

    try {
      await fetch('/api/spirits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spirits: updatedList }),
      });
    } catch (err) {
      console.warn('Aqua Vitaeum: Background server API sync failed, relying on local database cache.', err);
    }
  }, []);

  // Fetch initial spirit collection from local database or server API fallback
  useEffect(() => {
    let isMounted = true;
    async function loadSpirits() {
      let localSpirits: Spirit[] = [];
      try {
        localSpirits = await db.spirits.toArray();
      } catch (err) {
        console.warn('Aqua Vitaeum: Failed to load spirits from IndexedDB.', err);
      }

      // If local database is empty, seed from API endpoint (e.g. during dev/seeding)
      if (localSpirits.length === 0) {
        try {
          const res = await fetch('/api/spirits');
          if (res.ok) {
            const data = await res.json();
            if (isMounted && Array.isArray(data.spirits) && data.spirits.length > 0) {
              setSpirits(data.spirits);
              setSelectedId((prev) =>
                prev && data.spirits.some((s: Spirit) => s.id === prev) ? prev : data.spirits[0].id,
              );
              try {
                await db.spirits.bulkPut(data.spirits);
              } catch (err) {
                console.warn('Aqua Vitaeum: Could not seed IndexedDB from API.', err);
              }
              if (isMounted) setIsLoading(false);
              return;
            }
          }
        } catch (err) {
          console.warn('Aqua Vitaeum: Server fetch failed, attempting local cache fallback.', err);
        }
      } else {
        if (isMounted) {
          setSpirits(localSpirits);
          setSelectedId((prev) =>
            prev && localSpirits.some((s: Spirit) => s.id === prev) ? prev : localSpirits[0].id,
          );
        }
      }

      if (isMounted) setIsLoading(false);
    }

    loadSpirits();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeSpirit = useMemo(() => {
    return spirits.find((s) => s.id === selectedId) ?? createBlankSpirit();
  }, [spirits, selectedId]);

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
    setSelectedId(id);
  }, []);

  const handleNewNote = useCallback(() => {
    const blank = createBlankSpirit();
    setSpirits((prev) => {
      const next = [blank, ...prev];
      persistSpirits(next);
      return next;
    });
    setSelectedId(blank.id);
  }, [persistSpirits]);

  const handleSave = useCallback(
    (updated: Spirit) => {
      setSpirits((prev) => {
        const next = prev.some((s) => s.id === updated.id)
          ? prev.map((s) => (s.id === updated.id ? updated : s))
          : [updated, ...prev];
        persistSpirits(next);
        return next;
      });
      setSelectedId(updated.id);
    },
    [persistSpirits],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setSpirits((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (selectedId === id) {
          if (next.length > 0) {
            setSelectedId(next[0].id);
          } else {
            setSelectedId(null);
          }
        }
        persistSpirits(next);
        return next;
      });
    },
    [selectedId, persistSpirits],
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
