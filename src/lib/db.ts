import Dexie, { type Table } from 'dexie';
import { Spirit, Journal } from '@/types/spirit.types';

export class AquaVitaeumDatabase extends Dexie {
  spirits!: Table<Spirit>;
  journals!: Table<Journal>;

  constructor() {
    super('AquaVitaeumDB');
    this.version(1).stores({
      spirits: 'id, spiritType, distillery, name, rating100' // primary key and indexes
    });

    this.version(2).stores({
      spirits: 'id, journalId, spiritType, distillery, name, rating100', // Added journalId index
      journals: 'id, name, createdAt' // New journals table
    }).upgrade(async (tx) => {
      const defaultId = 'default-compendium';
      const count = await tx.table('journals').count();
      if (count === 0) {
        await tx.table('journals').add({
          id: defaultId,
          name: 'My Journal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      await tx.table('spirits').toCollection().modify((spirit: Spirit) => {
        if (!spirit.journalId) {
          spirit.journalId = defaultId;
        }
      });
    });
  }
}

export const db = new AquaVitaeumDatabase();
