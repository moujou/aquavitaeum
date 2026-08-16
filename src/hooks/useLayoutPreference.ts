'use client';
import { useState } from 'react';

export type OverviewLayout = 'list' | 'grid';

const STORAGE_KEY = 'av-overview-layout';

export function useLayoutPreference() {
  const [layout, setLayoutState] = useState<OverviewLayout>(() => {
    if (typeof window === 'undefined') return 'list';
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'grid' || stored === 'list' ? stored : 'list';
  });

  const setLayout = (l: OverviewLayout) => {
    setLayoutState(l);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, l);
    }
  };

  return { layout, setLayout };
}
