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

  constructor(
    version: string,
    height: number,
    timestamp: number,
    transactions: string[],
    targetHash: string,
    previousHash?: string,
    nonce?: number,
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

  public get transactionSize() {
    return this.transactions.size;
  }

  public get nonce() {
    return this._nonce;
  }

  private generateBlockHash(nonce: number) {
    return AppHash.createSha256Hash(
      `${this.version}${this.previousHash}${this.merkleRoot ? this.merkleRoot : 'null'}${this.transactionSize}${this.timestamp}${this.height}${nonce}`,
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

  public mine() {
    let blockHash = this.blockHash;
    let nonce = this._nonce;

    const target = BigInt(`0x${this.targetHash}`);

    while (BigInt(`0x${blockHash}`) > target) {
      nonce += 1;
      blockHash = this.generateBlockHash(nonce);
    }

    this._blockHash = blockHash;
    this._nonce = nonce;

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
