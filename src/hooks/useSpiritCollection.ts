import { useState, useCallback, useMemo, useEffect } from 'react';
import { Spirit, SpiritType } from '@/types/spirit.types';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { createBlankSpirit } from '@/lib/spirit-utils';
import { translateColour, translateGlance } from '@/lib/i18n/translations';

const LOCAL_STORAGE_KEY = 'aquavitaeum_spirits_journal';

export function useSpiritCollection(initialSpirits: Spirit[] = MOCK_SPIRITS) {
  const [spirits, setSpirits] = useState<Spirit[]>(initialSpirits);
  const [selectedId, setSelectedId] = useState<string | null>(initialSpirits[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpiritType | 'All'>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to persist array to server API endpoint and browser localStorage fallback
  const persistSpirits = useCallback(async (updatedList: Spirit[]) => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
      }
    } catch (err) {
      console.warn('Aqua Vitaeum: Failed to persist spirit collection to local storage cache.', err);
    }

    try {
      await fetch('/api/spirits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spirits: updatedList }),
      });
    } catch (err) {
      console.warn('Aqua Vitaeum: Background server API sync failed, relying on local storage cache.', err);
    }
  }, []);

  // Fetch initial spirit collection from server API endpoint or localStorage cache
  useEffect(() => {
    let isMounted = true;
    async function loadSpirits() {
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
              if (typeof window !== 'undefined') {
                window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.spirits));
              }
            } catch (err) {
              console.warn('Aqua Vitaeum: Could not update local storage cache from API.', err);
            }
            if (isMounted) setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Aqua Vitaeum: Server fetch failed, attempting local cache fallback.', err);
      }

      if (typeof window !== 'undefined') {
        try {
          const cached = window.localStorage.getItem(LOCAL_STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (isMounted && Array.isArray(parsed) && parsed.length > 0) {
              setSpirits(parsed);
              setSelectedId((prev) =>
                prev && parsed.some((s: Spirit) => s.id === prev) ? prev : parsed[0].id,
              );
            }
          }
        } catch (err) {
          console.warn('Aqua Vitaeum: Failed to parse cached spirits from local storage.', err);
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

      const glanceEN = s.glance.toLowerCase();
      const glanceDE = translateGlance(s.glance, 'DE').toLowerCase();

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
        let finalNext = next;
        if (selectedId === id) {
          if (next.length > 0) {
            setSelectedId(next[0].id);
          } else {
            const blank = createBlankSpirit();
            setSelectedId(blank.id);
            finalNext = [blank];
          }
        }
        persistSpirits(finalNext);
        return finalNext;
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
