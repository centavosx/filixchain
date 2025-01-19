import { Level } from 'level';
export class MempoolDb {
  readonly db: Level;

  constructor() {
    this.db = new Level('./mempool', { valueEncoding: 'json' });
  }

  mempool() {
    const db = new Level('./mempool', { valueEncoding: 'json' });
  }
}
