import { Level } from 'level';
export class BlockDb {
  readonly db: Level;

  constructor(path: string) {
    this.db = new Level(path, { valueEncoding: 'json' });
  }

  mempool() {
    const db = new Level('./mempool', { valueEncoding: 'json' });
  }
}
