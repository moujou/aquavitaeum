import { useState, useCallback, useEffect } from 'react';
import { Journal } from '@/types/spirit.types';
import { db } from '@/lib/db';
import {
  notifyDataMutated,
  DATA_MUTATED_EVENT,
  REMOTE_SYNC_COMPLETED_EVENT,
} from '@/lib/sync-events';
import { recordTombstone, removeTombstone } from '@/lib/sync-tombstones';
import { generateUuid } from '@/lib/spirit-utils';
import { getCategoryByDescriptorId, getFlavorColor } from '@/data/spirit-flavor-taxonomy';

export interface TopDramItem {
  name: string;
  rating: number;
}

export interface TopFlavorItem {
  name: string;
  emoji: string;
  color?: string;
}

export interface RecentSpiritItem {
  name: string;
  date?: string | null;
  rating?: number;
}

export interface JournalWithStats extends Journal {
  bottleCount: number;
  averageRating: number;
  latestTastedDate: string | null;
  latestSpiritName?: string | null;
  recentSpirits?: RecentSpiritItem[];
  topScore?: number;
  recentImages: string[];
  topDram?: TopDramItem | null;
  topDrams?: TopDramItem[];
  topFlavors?: TopFlavorItem[];
  distilleriesSummary?: string;
  distilleryCount?: number;
  regionsSummary?: string;
  regionCount?: number;
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

          // Get up to 3 most recently tasted bottles
          const sortedSpirits = [...spirits].sort((a, b) => (b.dateTasted || '').localeCompare(a.dateTasted || ''));
          const recentImages = sortedSpirits
            .map((s) => s.thumbnailImage || (s.images && s.images[0]))
            .filter((img): img is string => !!img)
            .slice(0, 3);

          const recentSpirits: RecentSpiritItem[] = sortedSpirits.slice(0, 3).map((s) => {
            const name =
              s.distillery && s.name
                ? s.name.toLowerCase().includes(s.distillery.toLowerCase())
                  ? s.name
                  : `${s.distillery} ${s.name}`
                : s.name || s.distillery || 'Unnamed Spirit';
            return {
              name,
              date: s.dateTasted || null,
              rating: s.rating100,
            };
          });

          const latestSpiritName = recentSpirits.length > 0 ? recentSpirits[0].name : null;

          // Calculate Top-3 Drams (Gold, Silver, Bronze sorted by rating100 descending)
          const ratedSpirits = spirits
            .filter((s) => s.rating100 && s.rating100 > 0)
            .sort((a, b) => (b.rating100 || 0) - (a.rating100 || 0));

          const topScore = ratedSpirits.length > 0 ? (ratedSpirits[0].rating100 || 0) : 0;

          const topDrams: TopDramItem[] = ratedSpirits.slice(0, 3).map((s) => ({
            name: s.name || s.distillery,
            rating: s.rating100,
          }));

          const topDram = topDrams.length > 0 ? topDrams[0] : null;

          // Calculate Distilleries & Regions summary
          const uniqueDistilleries = Array.from(
            new Set(spirits.map((s) => s.distillery).filter((d): d is string => !!d && d.trim().length > 0))
          );
          const distilleryCount = uniqueDistilleries.length;
          const distilleriesSummary =
            uniqueDistilleries.length > 0
              ? uniqueDistilleries.slice(0, 3).join(' · ') + (uniqueDistilleries.length > 3 ? ` +${uniqueDistilleries.length - 3}` : '')
              : undefined;

          const uniqueRegions = Array.from(
            new Set(spirits.map((s) => s.region).filter((r): r is string => !!r && r.trim().length > 0))
          );
          const regionCount = uniqueRegions.length;
          const regionsSummary =
            uniqueRegions.length > 0
              ? uniqueRegions.slice(0, 3).join(' · ') + (uniqueRegions.length > 3 ? ` +${uniqueRegions.length - 3}` : '')
              : undefined;

          // Calculate Top Flavors with category icons/emojis
          const tagCounts: Record<string, number> = {};
          spirits.forEach((s) => {
            const tags = [
              ...(s.flavorTags || []),
              ...(s.noseFlavorTags || []),
              ...(s.tasteFlavorTags || []),
            ];
            const unique = new Set(tags);
            unique.forEach((tag) => {
              if (tag && tag.trim()) {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              }
            });
          });

          const topFlavorNames = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([tag]) => tag);

          const topFlavors: TopFlavorItem[] = topFlavorNames.map((tag) => {
            const cat = getCategoryByDescriptorId(tag);
            return {
              name: tag,
              emoji: cat?.emoji || '🌿',
              color: getFlavorColor(tag),
            };
          });

          return {
            ...journal,
            bottleCount,
            averageRating,
            latestTastedDate,
            latestSpiritName,
            recentSpirits,
            topScore,
            recentImages,
            topDram,
            topDrams,
            topFlavors,
            distilleriesSummary,
            distilleryCount,
            regionsSummary,
            regionCount,
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

  // Live reactivity: listen to background sync / import updates / remote sync completions
  useEffect(() => {
    const handleDataChanged = () => {
      loadJournals();
    };
    window.addEventListener(DATA_MUTATED_EVENT, handleDataChanged);
    window.addEventListener(REMOTE_SYNC_COMPLETED_EVENT, handleDataChanged);
    return () => {
      window.removeEventListener(DATA_MUTATED_EVENT, handleDataChanged);
      window.removeEventListener(REMOTE_SYNC_COMPLETED_EVENT, handleDataChanged);
    };
  }, [loadJournals]);

  // Create a new journal
  const createJournal = useCallback(async (name: string, description?: string, coverImage?: string) => {
    const newJournal: Journal = {
      id: generateUuid(),
      name: name.trim() || 'New Journal',
      description,
      coverImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await db.journals.add(newJournal);
      removeTombstone(newJournal.id);
      await loadJournals();
      notifyDataMutated();
      return newJournal;
    } catch (err) {
      console.error('Aqua Vitaeum: Failed to create journal.', err);
      throw err;
    }
  }, [loadJournals]);

  // Rename an existing journal
  const renameJournal = useCallback(async (id: string, newName: string, newDescription?: string, newCoverImage?: string) => {
    try {
      await db.journals.update(id, {
        name: newName.trim(),
        description: newDescription !== undefined ? newDescription.trim() : undefined,
        ...(newCoverImage !== undefined && { coverImage: newCoverImage }),
        updatedAt: new Date().toISOString(),
      });
      removeTombstone(id);
      await loadJournals();
      notifyDataMutated();
    } catch (err) {
      console.error('Aqua Vitaeum: Failed to rename journal.', err);
      throw err;
    }
  }, [loadJournals]);

  // Delete an existing journal and cascade delete all its spirits
  const deleteJournal = useCallback(async (id: string) => {
    try {
      recordTombstone(id, 'journal');
      
      // Cascade record tombstones and delete all spirits in this journal
      const spiritsToDelete = await db.spirits.where('journalId').equals(id).toArray();
      for (const s of spiritsToDelete) {
        recordTombstone(s.id, 'spirit');
      }

      // 1. Delete journal metadata
      await db.journals.delete(id);
      
      // 2. Cascade delete all spirits in this journal to avoid orphan records
      await db.spirits.where('journalId').equals(id).delete();
      
      await loadJournals();
      notifyDataMutated();
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
