import { Level } from 'level';
export class MempoolDb {
  readonly db: Level<string>;

  constructor() {
    this.db = new Level('./mempool', { valueEncoding: 'json' });
  }

  mempool() {
    this.db.put();
  }
}
