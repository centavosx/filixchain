import { AppHash } from '@ph-blockchain/hash';
import { Transaction } from './transaction';
import { RawBlock } from './types';
import { Minter } from './minter';

export class Block {
  static version = '1';
  static readonly genesisHash =
    '0000000000000000000000000000000000000000000000000000000000000000';

  static MAX_TX_SIZE = 2000;

  readonly version: string;
  readonly height: number;
  readonly timestamp: number;
  readonly transactions = new Set<string>();
  readonly previousHash: string;
  readonly targetHash: string;

  private _blockHash: string;
  private _merkleRoot?: string | null;
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
    this.timestamp = timestamp ?? Date.now();
    this.transactions = new Set(transactions);
    this.previousHash = previousHash ?? Block.genesisHash;
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
      decoded:
        value.length === Minter.ENCODED_SIZE
          ? Minter.decode(value, this)
          : Transaction.decode(value, this),
    }));
  }

  public stopMining() {
    this.abortController?.abort();
  }

  public async mine(shouldLog?: boolean) {
    if (this._isMined) return this;

    this.abortController = new AbortController();

    const target = BigInt(`0x${this.targetHash}`);

    while (BigInt(`0x${this.blockHash}`) > target) {
      if (this.abortController.signal?.aborted) {
        return this;
      }

      this._nonce += 1;
      this._blockHash = this.generateBlockHash(this._nonce);

      if (shouldLog) process.stdout.write(`\rMINING HASH: ${this.blockHash}`);

      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    this._isMined = true;

    return this;
  }

  public toJson(includeTx = true): RawBlock {
    return {
      version: this.version,
      height: this.height,
      timestamp: this.timestamp,
      transactions: includeTx
        ? Array.from(this.transactions.values())
        : undefined,
      previousHash: this.previousHash,
      targetHash: this.targetHash,
      blockHash: this.blockHash,
      nonce: this.nonce,
      merkleRoot: this.merkleRoot,
      transactionSize: this.transactionSize,
    };
  }
}
