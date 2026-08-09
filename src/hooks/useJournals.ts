import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import { Journal } from '@/types/spirit.types';

export interface JournalWithStats extends Journal {
  bottleCount: number;
  averageRating: number;
  latestTastedDate: string | null;
  recentImages: string[];
}

export function useJournals() {
  const [journals, setJournals] = useState<JournalWithStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load journals and calculate real-time statistics
  const loadJournals = useCallback(async () => {
    try {
      const allJournals = await db.journals.toArray();
      
      // Calculate stats for each journal
      const journalsStats: JournalWithStats[] = await Promise.all(
        allJournals.map(async (journal) => {
          const spirits = await db.spirits.where('journalId').equals(journal.id).toArray();
          const bottleCount = spirits.length;
          
          const averageRating =
            bottleCount > 0
              ? Math.round(spirits.reduce((acc, s) => acc + s.rating100, 0) / bottleCount)
              : 0;

          const latestTastedDate = spirits.reduce<string | null>((latest, s) => {
            if (!s.dateTasted) return latest;
            if (!latest) return s.dateTasted;
            return s.dateTasted > latest ? s.dateTasted : latest;
          }, null);

          // Get images of up to 3 most recently tasted bottles
          const sortedSpirits = [...spirits].sort((a, b) => b.dateTasted.localeCompare(a.dateTasted));
          const recentImages = sortedSpirits
            .map((s) => s.thumbnailImage || (s.images && s.images[0]))
            .filter((img): img is string => !!img)
            .slice(0, 3);

          return {
            ...journal,
            bottleCount,
            averageRating,
            latestTastedDate,
            recentImages,
          };
        })
      );

      // Sort journals by creation date (newest first, or keep default-compendium first)
      journalsStats.sort((a, b) => {
        if (a.id === 'default-compendium') return -1;
        if (b.id === 'default-compendium') return 1;
        return b.createdAt.localeCompare(a.createdAt);
      });

      setJournals(journalsStats);
    } catch (err) {
      console.warn('Aqua Vitaeum: Failed to load journals from IndexedDB.', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJournals();
  }, [loadJournals]);

  // Create a new journal
  const createJournal = useCallback(async (name: string, description?: string) => {
    const newJournal: Journal = {
      id: `journal-${Date.now()}`,
      name: name.trim() || 'New Journal',
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.journals.add(newJournal);
      await loadJournals();
      return newJournal;
    } catch (err) {
      console.error('Aqua Vitaeum: Failed to create journal.', err);
      throw err;
    }
  }, [loadJournals]);

  // Rename an existing journal
  const renameJournal = useCallback(async (id: string, newName: string, newDescription?: string) => {
    try {
      await db.journals.update(id, {
        name: newName.trim(),
        description: newDescription !== undefined ? newDescription.trim() : undefined,
        updatedAt: new Date().toISOString(),
      });
      await loadJournals();
    } catch (err) {
      console.error('Aqua Vitaeum: Failed to rename journal.', err);
      throw err;
    }
  }, [loadJournals]);

  // Delete an existing journal and cascade delete all its spirits
  const deleteJournal = useCallback(async (id: string) => {
    try {
      // 1. Delete journal metadata
      await db.journals.delete(id);
      
      // 2. Cascade delete all spirits in this journal to avoid orphan records
      await db.spirits.where('journalId').equals(id).delete();
      
      await loadJournals();
    } catch (err) {
      console.error('Aqua Vitaeum: Failed to delete journal.', err);
      throw err;
    }
  }, [loadJournals]);

  return {
    journals,
    isLoading,
    createJournal,
    renameJournal,
    deleteJournal,
    refreshJournals: loadJournals,
  };
}
