import { Level } from 'level';

export class Account {
  readonly db: Level;

  constructor() {
    this.db = new Level('./accounts', { valueEncoding: 'json' });
  }

  updateData(nonce: number) {
    this.db.put('dawdaw', 'test');
  }
}
