'use client';
import { useState } from 'react';

export type OverviewLayout = 'list' | 'grid';
export type JournalShelfLayout = 'manuscript' | 'bookshelf';

const STORAGE_KEY_NOTES = 'av-overview-layout';
const STORAGE_KEY_JOURNALS = 'av-journal-layout';

export function useLayoutPreference() {
  const [layout, setLayoutState] = useState<OverviewLayout>(() => {
    if (typeof window === 'undefined') return 'list';
    const stored = localStorage.getItem(STORAGE_KEY_NOTES);
    return stored === 'grid' || stored === 'list' ? stored : 'list';
  });

  const [journalLayout, setJournalLayoutState] = useState<JournalShelfLayout>(() => {
    if (typeof window === 'undefined') return 'manuscript';
    const stored = localStorage.getItem(STORAGE_KEY_JOURNALS);
    return stored === 'bookshelf' || stored === 'manuscript' ? stored : 'manuscript';
  });

  const setLayout = (l: OverviewLayout) => {
    setLayoutState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_NOTES, l);
    }
  };

  const setJournalLayout = (l: JournalShelfLayout) => {
    setJournalLayoutState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_JOURNALS, l);
    }
  };

  return { layout, setLayout, journalLayout, setJournalLayout };
}
