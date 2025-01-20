import { Crypto } from '@ph-blockchain/hash';
import { Level } from 'level';
import { RawAccountData } from './types';
import { Transaction } from './transaction';
import { SearchListQuery } from './types/search';

export class Account {
  private readonly pendingTxToSave: Transaction[] = [];

  private _address: string;
  private _nonce: bigint;
  private _amount: bigint;

  constructor(address: string, amount: string, nonce: string) {
    this._address = address;
    this._nonce = Crypto.decode32BytesStringtoBigInt(nonce);
    this._amount = Crypto.decode32BytesStringtoBigInt(amount);
  }

  get address() {
    return this._address;
  }

  get nonce() {
    return this._nonce;
  }

  get amount() {
    return this._amount;
  }

  get pendingTxs() {
    return this.pendingTxToSave;
  }

  decreaseAmount(amountToDecrease: bigint) {
    this._amount -= amountToDecrease;
  }

  increaseAmount(amountToIncrease: bigint) {
    this._amount += amountToIncrease;
  }

  incrementNonce() {
    this._nonce += BigInt(1);
  }

  addTransaction(...transaction: Transaction[]) {
    const temporaryTx: Transaction[] = [];
    let temporaryNonce = this._nonce;
    let amount = this._amount;

    for (const tx of transaction) {
      // Transaction nonce are validated first before being added
      if (tx.nonce !== this._nonce) {
        throw new Error("Tx nonce is not valid for the current user's nonce");
      }

      if (tx.rawFromAddress !== this._address) {
        throw new Error('This transaction is not for this account');
      }

      amount -= tx.amount;
      temporaryTx.push(tx);
      temporaryNonce++;
    }

    if (amount < 0) throw new Error('Not enough balance for this transactions');

    this._amount = amount;
    this.pendingTxToSave.push(...temporaryTx);
    this._nonce = temporaryNonce;
  }

  receiveTransaction(...transaction: Transaction[]) {
    const temporaryTx: Transaction[] = [];
    let temporaryNonce = this._nonce;
    let amount = this._amount;

    for (const tx of transaction) {
      // Transaction added should be sent to this address
      if (tx.rawToAddress !== this._address) {
        throw new Error(`Transaction is not sent to this account`);
      }

      amount += tx.amount;
      temporaryTx.push(tx);
      temporaryNonce++;
    }

    this._amount = amount;
  }
}

export class AccountDb {
  private _isOpen = false;
  private _db: Level<string, RawAccountData>;
  private _txDb: ReturnType<typeof this.intializeTx>;

  public get db() {
    return this._db;
  }

  public intializeTx() {
    return this._db.sublevel<string, string>('transactions', {});
  }

  public async initialize() {
    if (this._isOpen) return;
    this._db = new Level('./database/accounts', { valueEncoding: 'json' });
    await this._db.open();
    this._txDb = this.intializeTx();
    await this._txDb.open();
    this._isOpen = true;
  }

  public createAccount(address: string, data: RawAccountData) {
    const rawAmount = data?.amount || Crypto.zero32BytesString;
    const rawNonce = data?.nonce || Crypto.zero32BytesString;
    return new Account(address, rawAmount, rawNonce);
  }

  public async findByAddress<T extends string | Array<string>>(address: T) {
    if (Array.isArray(address)) {
      const accounts = await this._db.getMany(address);

      return address.map((value, index) => {
        const accountData = accounts[index];
        return this.createAccount(value, accountData);
      });
    }

    const accountData = await this._db.get(address);

    return this.createAccount(address, accountData);
  }

  public toJsonData(account: Account): RawAccountData {
    return {
      amount: Crypto.encodeIntTo32BytesString(account.amount),
      nonce: Crypto.encodeIntTo32BytesString(account.nonce),
    };
  }

  public async save(blockTimestamp: number, accounts: Account | Account[]) {
    const txBatch = this._txDb.batch();
    const batch = this._db.batch();
    try {
      for (const account of Array.isArray(accounts) ? accounts : [accounts]) {
        for (const tx of account.pendingTxs) {
          const currentTxId = tx.transactionId;
          const rawFromAddress = tx.rawFromAddress;
          const rawToAddress = tx.rawToAddress;
          txBatch.put(`${rawFromAddress}-${blockTimestamp}`, currentTxId);
          txBatch.put(`${rawToAddress}-${blockTimestamp}`, currentTxId);
        }
        batch.put(account.address, this.toJsonData(account));
      }
      return () => ({
        write: async () => {
          await Promise.all([txBatch.write(), batch.write()]);
        },
      });
    } catch (e) {
      await Promise.all([txBatch.close(), batch.close()]);
      throw e;
    }
  }

  public async getTx(
    account: Account,
    { start = 0, end, limit, reverse }: SearchListQuery = {},
  ) {
    if (start < 0) throw new Error('Not valid start index');

    const data = await this._txDb
      .values({
        gte: `${account.address}-${start}`,
        ...(!!end && {
          lte: `${account.address}-${end}`,
        }),
        ...(!!limit && {
          limit,
        }),
        reverse,
      })
      .all();

    return data;
  }
}
