import { Crypto } from '@ph-blockchain/hash';
import { Level } from 'level';
import { RawAccountData } from './types';
import { Transaction } from './transaction';
import { SearchListQuery } from './types/search';
import { Minter } from './minter';

export class Account {
  private static _isOpen = false;
  private static _db: Level<string, RawAccountData>;
  private static _txDb: ReturnType<typeof this.intializeTx>;

  private readonly pendingTxToSave: (Transaction | Minter)[] = [];

  private _address: string;
  private _nonce: bigint;
  private _amount: bigint;

  constructor(address: string, amount: string, nonce: string) {
    this._address = address;
    this._nonce = Crypto.decode8BytesStringtoBigInt(nonce);
    this._amount = Crypto.decode8BytesStringtoBigInt(amount);
  }

  serialize() {
    return {
      address: this._address,
      nonce: this._nonce.toString(),
      amount: this._amount.toString(),
    };
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

  incrementNonce() {
    this._nonce += BigInt(1);
  }

  addTotalFee(reward: bigint) {
    this._amount += reward;
  }

  reduceAmountWithFee(fee: bigint) {
    let amount = this._amount;

    amount -= fee;

    if (amount < 0) throw new Error('Not enough balance to pay for the fee');

    this._amount = amount;
  }

  addTransaction(...transaction: (Transaction | Minter)[]) {
    const temporaryTx: (Transaction | Minter)[] = [];
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

      if (tx instanceof Transaction) {
        amount -= tx.amount + Transaction.FIXED_FEE;
      }
      temporaryTx.push(tx);
      temporaryNonce++;
    }

    if (amount < 0) throw new Error('Not enough balance for this transactions');

    this._amount = amount;
    this.pendingTxToSave.push(...temporaryTx);
    this._nonce = temporaryNonce;
  }

  receiveTransaction(...transaction: (Transaction | Minter)[]) {
    let amount = this._amount;

    for (const tx of transaction) {
      // Transaction added should be sent to this address
      if (tx.rawToAddress !== this._address) {
        throw new Error(`Transaction is not sent to this account`);
      }

      amount += tx.amount;
    }

    this._amount = amount;
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
    Account._txDb = this.intializeTx();
    await Account._txDb.open();
    Account._isOpen = true;
  }

  public static createAccount(address: string, data: RawAccountData) {
    const rawAmount = data?.amount || Crypto.zero8BytesString;
    const rawNonce = data?.nonce || Crypto.zero8BytesString;
    return new Account(address, rawAmount, rawNonce);
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

  public static toJsonData(account: Account): RawAccountData {
    return {
      amount: Crypto.encodeIntTo8BytesString(account.amount),
      nonce: Crypto.encodeIntTo8BytesString(account.nonce),
    };
  }

  public static async save(
    blockTimestamp: number,
    accounts: Account | Account[],
  ) {
    const txBatch = Account._txDb.batch();
    const batch = Account._db.batch();
    try {
      const addressTxNum: Record<string, number> = {};
      for (const account of Array.isArray(accounts) ? accounts : [accounts]) {
        for (const tx of account.pendingTxs) {
          const currentTxId = tx.transactionId;
          const rawFromAddress = tx.rawFromAddress;
          const rawToAddress = tx.rawToAddress;

          const fromTxNum = addressTxNum[rawFromAddress] || 0;
          const toTxNum = addressTxNum[rawToAddress] || 0;
          const bothTxNum =
            addressTxNum[`${rawFromAddress}-${rawToAddress}`] || 0;

          txBatch.put(
            `${rawFromAddress}-${blockTimestamp}-${fromTxNum}`,
            currentTxId,
          );
          txBatch.put(
            `${rawToAddress}-${blockTimestamp}-${toTxNum}`,
            currentTxId,
          );
          txBatch.put(
            `${rawFromAddress}-${rawToAddress}-${blockTimestamp}-${bothTxNum}`,
            currentTxId,
          );
          addressTxNum[rawFromAddress] = fromTxNum + 1;
          addressTxNum[rawToAddress] = toTxNum + 1;
          addressTxNum[`${rawFromAddress}-${rawToAddress}`] = bothTxNum + 1;
        }
        batch.put(account.address, this.toJsonData(account));
      }
      return {
        write: async () => {
          await Promise.all([txBatch.write(), batch.write()]);
        },
      };
    } catch (e) {
      await Promise.all([txBatch.close(), batch.close()]);
      throw e;
    }
  }

  public static async getTx(
    account: Account,
    {
      start = 1706026109489,
      end = Date.now(),
      limit,
      reverse,
      from,
      to,
    }: SearchListQuery = {},
  ) {
    if (start < 1706026109489) throw new Error('Not valid start index');

    let query = {
      gte: `${account.address}-${start}`,
      lte: `${account.address}-${end}\xFF`,
      ...(!!limit && {
        limit,
      }),
      reverse,
    };

    if (from || to) {
      const fromAddress = !!to ? account._address : from;
      const toAddress = !!from ? account._address : to;

      const filter = `${fromAddress}-${toAddress}`;
      query.gte = `${filter}-${start}`;
      query.lte = `${filter}-${end}\xFF`;
    }

    const data = await Account._txDb.values(query).all();

    return data;
  }
}
