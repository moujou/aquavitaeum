import Dexie, { type Table } from 'dexie';
import { Spirit } from '@/types/spirit.types';

export class AquaVitaeumDatabase extends Dexie {
  spirits!: Table<Spirit>;

  constructor() {
    super('AquaVitaeumDB');
    this.version(1).stores({
      spirits: 'id, spiritType, distillery, name, rating100' // primary key and indexes
    });
  }
}

export const db = new AquaVitaeumDatabase();
