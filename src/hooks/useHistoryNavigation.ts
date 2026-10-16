'use client';

import { useEffect, useCallback, useRef } from 'react';

export type NavigationView = 'welcome' | 'overview' | 'journal-landing' | 'journal-detail' | 'profile';

export interface HistoryStatePayload {
  aquaVitaeum: true;
  view: NavigationView;
  journalId?: string | null;
  spiritId?: string | null;
  fromView?: 'overview' | 'journal-landing' | 'journal-detail';
}

export interface UseHistoryNavigationProps {
  onPopState: (state: HistoryStatePayload) => void;
  fallbackBack?: () => void;
}

export interface UseHistoryNavigationReturn {
  pushView: (
    view: NavigationView,
    options?: {
      journalId?: string | null;
      spiritId?: string | null;
      fromView?: 'overview' | 'journal-landing' | 'journal-detail';
    }
  ) => void;
  replaceView: (
    view: NavigationView,
    options?: {
      journalId?: string | null;
      spiritId?: string | null;
      fromView?: 'overview' | 'journal-landing' | 'journal-detail';
    }
  ) => void;
  navigateBack: () => void;
  initRootHistory: (view?: NavigationView, journalId?: string | null, spiritId?: string | null) => void;
}

/**
 * useHistoryNavigation
 *
 * Integrates Aqua Vitaeum's SPA view state with the native HTML5 History API.
 * This enables the mobile OS edge-swipe gesture navigation (Google Pixel/Android back gesture
 * and iOS Safari edge-swipe) to natively navigate up the breadcrumb hierarchy:
 *
 *   Journal Detail ➔ Journal Landing ➔ Journal Overview (Root) ➔ Exit App
 *   Profile ➔ Prior View (Overview/Landing/Detail)
 *
 * Eliminates custom touch-listener hacks in favor of the OS-native popstate standard.
 */
export function useHistoryNavigation({
  onPopState,
  fallbackBack,
}: UseHistoryNavigationProps): UseHistoryNavigationReturn {
  const onPopStateRef = useRef(onPopState);
  const fallbackBackRef = useRef(fallbackBack);

  useEffect(() => {
    onPopStateRef.current = onPopState;
    fallbackBackRef.current = fallbackBack;
  });

  // Listen to native browser & OS popstate events (Android back gesture, iOS edge swipe, desktop Back button)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as HistoryStatePayload | null;
      if (state && state.aquaVitaeum) {
        onPopStateRef.current(state);
      } else {
        // Fallback to overview root if history stack reaches initial uninitialized entry
        onPopStateRef.current({
          aquaVitaeum: true,
          view: 'overview',
          journalId: null,
          spiritId: null,
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const pushView = useCallback(
    (
      view: NavigationView,
      options?: {
        journalId?: string | null;
        spiritId?: string | null;
        fromView?: 'overview' | 'journal-landing' | 'journal-detail';
      }
    ) => {
      if (typeof window === 'undefined') return;

      const state: HistoryStatePayload = {
        aquaVitaeum: true,
        view,
        journalId: options?.journalId ?? null,
        spiritId: options?.spiritId ?? null,
        fromView: options?.fromView,
      };

      window.history.pushState(state, '');
    },
    []
  );

  const replaceView = useCallback(
    (
      view: NavigationView,
      options?: {
        journalId?: string | null;
        spiritId?: string | null;
        fromView?: 'overview' | 'journal-landing' | 'journal-detail';
      }
    ) => {
      if (typeof window === 'undefined') return;

      const state: HistoryStatePayload = {
        aquaVitaeum: true,
        view,
        journalId: options?.journalId ?? null,
        spiritId: options?.spiritId ?? null,
        fromView: options?.fromView,
      };

      window.history.replaceState(state, '');
    },
    []
  );

  const navigateBack = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (window.history.state && (window.history.state as HistoryStatePayload).aquaVitaeum) {
      window.history.back();
    } else if (fallbackBackRef.current) {
      fallbackBackRef.current();
    } else {
      window.history.back();
    }
  }, []);

  const initRootHistory = useCallback(
    (view: NavigationView = 'overview', journalId: string | null = null, spiritId: string | null = null) => {
      if (typeof window === 'undefined') return;

      // If history.state already exists and is an Aqua Vitaeum state, preserve it across re-renders
      if (window.history.state && (window.history.state as HistoryStatePayload).aquaVitaeum) {
        return;
      }

      // Seed hierarchy so Android back gesture always has the proper ancestry even on page reload
      if (view === 'overview' || view === 'welcome') {
        const state: HistoryStatePayload = {
          aquaVitaeum: true,
          view,
          journalId,
          spiritId,
        };
        window.history.replaceState(state, '');
      } else if (view === 'journal-landing') {
        window.history.replaceState({ aquaVitaeum: true, view: 'overview' }, '');
        window.history.pushState({ aquaVitaeum: true, view: 'journal-landing', journalId }, '');
      } else if (view === 'journal-detail') {
        window.history.replaceState({ aquaVitaeum: true, view: 'overview' }, '');
        window.history.pushState({ aquaVitaeum: true, view: 'journal-landing', journalId }, '');
        window.history.pushState({ aquaVitaeum: true, view: 'journal-detail', journalId, spiritId }, '');
      } else if (view === 'profile') {
        window.history.replaceState({ aquaVitaeum: true, view: 'overview' }, '');
        window.history.pushState({ aquaVitaeum: true, view: 'profile', journalId }, '');
      }
    },
    []
  );

  return {
    pushView,
    replaceView,
    navigateBack,
    initRootHistory,
  };
}
