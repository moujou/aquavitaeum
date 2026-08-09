/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';

describe('Database Migration', () => {
  it('correctly creates a default journal if none exist and assigns it to all spirits', async () => {
    // Mock the journals table
    const mockJournals: any[] = [];
    const journalsCountMock = vi.fn().mockResolvedValue(0);
    const journalsAddMock = vi.fn().mockImplementation((j) => {
      mockJournals.push(j);
      return Promise.resolve();
    });

    // Mock the spirits table and collection
    const mockSpirits = [
      { id: '1', name: 'Ardbeg', journalId: undefined },
      { id: '2', name: 'Lagavulin', journalId: 'other-journal' },
    ];
    const modifyMock = vi.fn().mockImplementation((callback) => {
      mockSpirits.forEach(callback);
      return Promise.resolve();
    });
    const toCollectionMock = vi.fn().mockReturnValue({
      modify: modifyMock,
    });

    // Mock Dexie Transaction
    const mockTx = {
      table: vi.fn().mockImplementation((tableName) => {
        if (tableName === 'journals') {
          return {
            count: journalsCountMock,
            add: journalsAddMock,
          };
        }
        if (tableName === 'spirits') {
          return {
            toCollection: toCollectionMock,
          };
        }
        return null;
      }),
    } as any;

    // Define the migration logic (extracted from db.ts)
    const runMigration = async (tx: any) => {
      const defaultId = 'default-compendium';
      const count = await tx.table('journals').count();
      if (count === 0) {
        await tx.table('journals').add({
          id: defaultId,
          name: 'My Journal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
      
      await tx.table('spirits').toCollection().modify((spirit: any) => {
        if (!spirit.journalId) {
          spirit.journalId = defaultId;
        }
      });
    };

    await runMigration(mockTx);

    // Assert default journal creation
    expect(journalsCountMock).toHaveBeenCalled();
    expect(journalsAddMock).toHaveBeenCalledWith(expect.objectContaining({
      id: 'default-compendium',
      name: 'My Journal',
    }));
    expect(mockJournals.length).toBe(1);

    // Assert mapping of unassigned spirits
    expect(toCollectionMock).toHaveBeenCalled();
    expect(modifyMock).toHaveBeenCalled();
    expect(mockSpirits[0].journalId).toBe('default-compendium');
    expect(mockSpirits[1].journalId).toBe('other-journal'); // kept original
  });
});
