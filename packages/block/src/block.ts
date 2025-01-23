import { AppHash, Crypto } from '@ph-blockchain/hash';
import { Transaction } from './transaction';
import { Blockchain } from './blockchain';
import { RawBlock } from './types';

export class Block {
  static MAX_TX_SIZE = 2000;

  readonly version: string;
  readonly height: number;
  readonly timestamp: number;
  readonly transactions = new Set<string>();
  readonly previousHash: string;
  readonly targetHash: string;

  private _blockHash: string;
  private _merkleRoot: string;
  private _nonce = 0;
  private _isMined = false;

  private abortController: AbortController;

  constructor(
    version: string,
    height: number,
    transactions: string[],
    targetHash: string,
    previousHash?: string,
    nonce?: number,
    timestamp?: number,
  ) {
    this.version = version;
    this.height = height;
    this.timestamp = timestamp;
    this.transactions = new Set(transactions);
    this.previousHash = previousHash ?? Blockchain.genesisHash;
    this.targetHash = targetHash;
    this._nonce = nonce ?? 0;
  }

  public get merkleRoot() {
    if (this._merkleRoot === undefined)
      this._merkleRoot =
        AppHash.generateMerkleRoot(Array.from(this.transactions.values())) ||
        null;

    return this._merkleRoot;
  }

  public get isMined() {
    return this._isMined;
  }

  public get transactionSize() {
    return this.transactions.size;
  }

  public get nonce() {
    return this._nonce;
  }

  private generateBlockHash(nonce: number) {
    return AppHash.createSha256Hash(
      `${this.version}${this.previousHash}${this.merkleRoot ? this.merkleRoot : 'null'}${this.transactionSize}${this.height}${nonce}`,
    );
  }

  public get blockHash() {
    if (!this._blockHash) {
      this._blockHash = this.generateBlockHash(this.nonce);
    }
    return this._blockHash;
  }

  public decodeTransactions() {
    return Array.from(this.transactions.values()).map((value) => ({
      encoded: value,
      decoded: Transaction.decode(value),
    }));
  }

  public stopMining() {
    this.abortController?.abort();
  }

  public async mine(shouldLog?: boolean) {
    if (this._isMined) return this;

    this.abortController = new AbortController();

    const target = BigInt(`0x${this.targetHash}`);

    if (shouldLog) process.stdout.write('\n');

    while (BigInt(`0x${this.blockHash}`) > target) {
      if (this.abortController.signal?.aborted) {
        if (shouldLog) process.stdout.write('\rMINING STOPPED....');
        return this;
      }

      this._nonce += 1;
      this._blockHash = this.generateBlockHash(this._nonce);

      if (shouldLog) process.stdout.write(`\rMINING HASH: ${this.blockHash}`);

      await new Promise((resolve) => setTimeout(resolve, 0)); // Yield control back to the event loop
    }

    this._isMined = true;

    if (shouldLog) process.stdout.write(`\rMINED!!!: ${this._blockHash}`);

    return this;
  }

  public toJson(): RawBlock {
    return {
      version: this.version,
      height: this.height,
      timestamp: this.timestamp,
      transactions: Array.from(this.transactions.values()),
      previousHash: this.previousHash,
      targetHash: this.targetHash,
      blockHash: this.blockHash,
      nonce: this.nonce,
      merkleRoot: this.merkleRoot,
      transactionSize: this.transactionSize,
    };
  }
}
