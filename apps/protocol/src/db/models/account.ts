import {
  Account as BlockAccount,
  Minter,
  Transaction,
} from '@ph-blockchain/block';
import { Crypto } from '@ph-blockchain/hash';
import { Level } from 'level';
import { AccountTransactionSearchDto } from '../../dto/account-tx-search.dto';

export type DefaultSubLevel = ReturnType<Level['sublevel']>;
export type InnerSublevel = ReturnType<DefaultSubLevel['sublevel']>;

export class Account extends BlockAccount {
  private _isOpen = false;
  private static _isOpen = false;
  private static _db: Level<string, string>;

  // Creating index to easily filter and fetch data.
  private rowIndexSublevelInstance: DefaultSubLevel;
  private timestampIndexSublevelInstance: DefaultSubLevel;
  private receiveIndexSublevelInstance: DefaultSubLevel;
  private sentIndexSublevelInstance: DefaultSubLevel;

  private _batches: ReturnType<typeof this.createBatch>;

  private readonly pendingTxToSave: (Transaction | Minter)[] = [];

  static createRowIndexKey(address: string) {
    return `${address}-rowIndex`;
  }

  private async initRowIndexSubLevel() {
    const instance = Account._db.sublevel(
      Account.createRowIndexKey(this._address),
      {},
    );
    await instance.open();
    this.rowIndexSublevelInstance = instance;
  }

  static createTimestampIndexKey(address: string) {
    return `${address}-timestampIndex`;
  }

  private async initTimestampIndexSubLevel() {
    const instance = Account._db.sublevel<string, string>(
      Account.createTimestampIndexKey(this._address),
      {},
    );
    await instance.open();
    this.timestampIndexSublevelInstance = instance;
  }

  static createReceiveIndexKey(address: string) {
    return `${address}-receiveIndex`;
  }

  private async initReceiveIndexSubLevel() {
    const instance = Account._db.sublevel<string, string>(
      Account.createReceiveIndexKey(this._address),
      {},
    );
    await instance.open();
    this.receiveIndexSublevelInstance = instance;
  }

  static createSentIndexKey(address: string) {
    return `${address}-sentIndex`;
  }

  private async initSentIndexSubLevel() {
    const instance = Account._db.sublevel<string, string>(
      Account.createSentIndexKey(this._address),
      {},
    );
    await instance.open();
    this.sentIndexSublevelInstance = instance;
  }

  public async initDb() {
    if (this._isOpen) return;
    await this.initRowIndexSubLevel();
    await this.initTimestampIndexSubLevel();
    await this.initReceiveIndexSubLevel();
    await this.initSentIndexSubLevel();
    this._isOpen = true;
  }

  private createBatch() {
    const newBatches = {
      receive: this.receiveIndexSublevelInstance.batch(),
      timestamp: this.timestampIndexSublevelInstance.batch(),
      rowIndex: this.rowIndexSublevelInstance.batch(),
      sent: this.sentIndexSublevelInstance.batch(),
    } as const;
    return newBatches;
  }

  public get batches() {
    return this._batches;
  }

  public startBatch() {
    if (!this._batches) this._batches = this.createBatch();
    return this._batches;
  }

  public async writeBatch() {
    if (!this._batches) throw new Error('Batch is not open');

    await Promise.all([
      this._batches.receive.write(),
      this._batches.sent.write(),
      this._batches.rowIndex.write(),
      this._batches.timestamp.write(),
    ]);

    this._batches = undefined;
    return;
  }

  public async closeDb() {
    await Promise.all([
      this.rowIndexSublevelInstance.close(),
      this.timestampIndexSublevelInstance.close(),
      this.receiveIndexSublevelInstance.close(),
      this.sentIndexSublevelInstance.close(),
    ]);
    this._isOpen = false;
  }

  public async writeBatchAndSaveAccount() {
    await Promise.all([
      this.writeBatch(),
      Account._db.put(this.address, Account.toRawData(this)),
    ]);
    await this.closeDb();
  }

  public async rejectBatch() {
    if (!this._batches) throw new Error('Batch is not open');

    await Promise.all([
      this._batches.receive.close(),
      this._batches.sent.close(),
      this._batches.rowIndex.close(),
      this._batches.timestamp.close(),
    ]);

    this._batches = undefined;
    return;
  }

  public async rejectAndClose() {
    await this.rejectBatch();
    await this.closeDb();
  }

  get pendingTxs() {
    return this.pendingTxToSave;
  }

  incrementNonce() {
    this._nonce += BigInt(1);
  }

  addTotalFee(reward: bigint) {
    this._amount += reward;
  }

  addTransaction(...transaction: (Transaction | Minter)[]) {
    const temporaryTx: (Transaction | Minter)[] = [];
    let temporaryNonce = this._nonce;
    let amount = this._amount;
    let temporarySize = this._size;
    const batchesTemp: {
      txId: string;
      rowIndex: string;
      sent: string;
      timestamp?: string;
    }[] = [];

    for (const tx of transaction) {
      // Transaction nonce are validated first before being added
      if (tx.nonce !== this._nonce) {
        throw new Error('Nonce has already been used.');
      }

      if (tx.rawFromAddress !== this._address) {
        throw new Error('Invalid transaction for this account');
      }

      if (tx instanceof Transaction) {
        amount -= tx.amount + Transaction.FIXED_FEE;
      }

      if (this._batches) {
        batchesTemp.push({
          txId: tx.transactionId,
          sent: `${tx.rawToAddress}-${temporaryNonce.toString()}`,
          rowIndex: Crypto.encodeIntTo8BytesString(temporarySize),
          timestamp: tx.timestamp
            ? `${Crypto.encodeIntTo8BytesString(tx.timestamp)}-${temporarySize.toString()}`
            : undefined,
        });
      }

      temporaryTx.push(tx);
      temporaryNonce++;
      temporarySize++;
    }

    if (amount < 0) throw new Error('Not enough balance for this transactions');

    this._size = temporarySize;
    this._amount = amount;
    this.pendingTxToSave.push(...temporaryTx);
    this._nonce = temporaryNonce;

    for (const batch of batchesTemp) {
      const { txId, sent, rowIndex, timestamp } = batch;
      this._batches.rowIndex.put(rowIndex, txId);
      this._batches.sent.put(sent, txId);
      if (timestamp) this._batches.timestamp.put(timestamp, txId);
    }
  }

  receiveTransaction(...transaction: (Transaction | Minter)[]) {
    let amount = this._amount;
    let temporarySize = this._size;
    const batchesTemp: {
      txId: string;
      rowIndex: string;
      receive: string;
      timestamp?: string;
    }[] = [];

    for (const tx of transaction) {
      // Transaction added should be sent to this address
      if (tx.rawToAddress !== this._address) {
        throw new Error(`Invalid transaction for this account`);
      }

      if (this._batches) {
        batchesTemp.push({
          txId: tx.transactionId,
          receive: `${tx.rawFromAddress}-${tx.nonce.toString()}`,
          rowIndex: Crypto.encodeIntTo8BytesString(temporarySize),
          timestamp: tx.timestamp
            ? `${Crypto.encodeIntTo8BytesString(tx.timestamp)}-${temporarySize.toString()}`
            : undefined,
        });
      }

      temporarySize++;
      amount += tx.amount;
    }

    this._amount = amount;
    this._size = temporarySize;

    for (const batch of batchesTemp) {
      const { txId, receive, rowIndex, timestamp } = batch;
      this._batches.rowIndex.put(rowIndex, txId);
      this._batches.receive.put(receive, txId);
      if (timestamp) this._batches.timestamp.put(timestamp, txId);
    }
  }

  public static get db() {
    return Account._db;
  }

  public static intializeTx() {
    return Account._db.sublevel<string, string>('transactions', {});
  }

  public static async initialize() {
    if (Account._isOpen) return;
    Account._db = new Level('./database/accounts', { valueEncoding: 'json' });
    await Account._db.open();
    Account._isOpen = true;
  }

  public static createAccount(address: string, data: string) {
    const rawAmount = data?.substring(0, 16) || Crypto.zero8BytesString;
    const rawNonce = data?.substring(16, 32) || Crypto.zero8BytesString;
    const rawSize = data?.substring(32, 48) || Crypto.zero8BytesString;
    return new Account(address, rawAmount, rawNonce, rawSize);
  }

  public static async findByAddress<T extends string | Array<string>>(
    address: T,
  ) {
    if (Array.isArray(address)) {
      const accounts = await Account._db.getMany(address);

      return address.map((value, index) => {
        const accountData = accounts[index];
        return Account.createAccount(value, accountData);
      }) as T extends string ? Account : Account[];
    }

    const accountData = await Account._db.get(address);

    return Account.createAccount(address, accountData) as T extends string
      ? Account
      : Account[];
  }

  public static toRawData(account: Account) {
    return `${Crypto.encodeIntTo8BytesString(account.amount)}${Crypto.encodeIntTo8BytesString(account.nonce)}${Crypto.encodeIntTo8BytesString(account.size)}`;
  }

  public static async getTx(
    account: Account,
    {
      start = 0,
      end,
      limit,
      reverse,
      from,
      to,
    }: AccountTransactionSearchDto = {},
  ) {
    const query = {
      gte: Crypto.encodeIntTo8BytesString(start),
      lte: end ? Crypto.encodeIntTo8BytesString(end) : undefined,
      ...(!!limit && {
        limit,
      }),
      reverse,
    };

    let index = this.createRowIndexKey(account._address);

    if (from && to) {
      throw new Error('Can only select between from or to');
    }

    if (from) {
      index = this.createReceiveIndexKey(account._address);
      query.gte = `${from}`;
      query.lte = `${from}\xFF`;
    }

    if (to) {
      index = this.createSentIndexKey(account._address);
      query.gte = `${to}`;
      query.lte = `${to}\xFF`;
    }

    const sublevel = Account._db.sublevel<string, string>(index, {});
    await sublevel.open();
    const data = await sublevel.values(query).all();
    await sublevel.close();

    return data;
  }
}
