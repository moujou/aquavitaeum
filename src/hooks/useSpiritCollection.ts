import { useState, useCallback, useMemo } from 'react';
import { Spirit, SpiritType } from '@/types/spirit.types';
import { MOCK_SPIRITS } from '@/data/mock-spirits';
import { createBlankSpirit } from '@/lib/spirit-utils';

export function useSpiritCollection(initialSpirits: Spirit[] = MOCK_SPIRITS) {
  const [spirits, setSpirits] = useState<Spirit[]>(initialSpirits);
  const [selectedId, setSelectedId] = useState<string | null>(initialSpirits[0]?.id ?? null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpiritType | 'All'>('All');

  const activeSpirit = useMemo(() => {
    return spirits.find((s) => s.id === selectedId) ?? createBlankSpirit();
  }, [spirits, selectedId]);

  const filteredSpirits = useMemo(() => {
    return spirits.filter((s) => {
      const matchesType = typeFilter === 'All' || s.spiritType === typeFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        s.distillery.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.spiritType.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [spirits, search, typeFilter]);

  const selectSpirit = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleNewNote = useCallback(() => {
    const blank = createBlankSpirit();
    setSpirits((prev) => [blank, ...prev]);
    setSelectedId(blank.id);
  }, []);

  const handleSave = useCallback((updated: Spirit) => {
    setSpirits((prev) =>
      prev.some((s) => s.id === updated.id)
        ? prev.map((s) => (s.id === updated.id ? updated : s))
        : [updated, ...prev],
    );
    setSelectedId(updated.id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSpirits((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (selectedId === id) {
        if (next.length > 0) {
          setSelectedId(next[0].id);
        } else {
          const blank = createBlankSpirit();
          setSelectedId(blank.id);
          return [blank];
        }
      }
      return next;
    });
  }, [selectedId]);

  return {
    spirits,
    filteredSpirits,
    selectedId,
    activeSpirit,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    selectSpirit,
    handleNewNote,
    handleSave,
    handleDelete,
  };
}
