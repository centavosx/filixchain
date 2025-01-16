import { AppHash } from '@ph-blockchain/hash';

export class Block {
  public readonly size = 1000000;

  readonly version: string;
  readonly index: number;
  readonly timestamp: number;
  readonly transactions = new Set<string>();
  readonly previousHash: string | null;

  nonce: number;

  constructor(
    version: string,
    index: number,
    timestamp: number,
    transactions: string[],
    nonce: number,
    previousHash: string,
  ) {
    this.version = version;
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = new Set(transactions);
    this.previousHash = previousHash;
    this.nonce = nonce;
  }

  public get merkleRoot() {
    return AppHash.generateMerkleRoot([...this.transactions.values()]);
  }

  public get transactionSize() {
    return this.transactions.size;
  }

  public get blockHash() {
    return AppHash.createSha256Hash(
      `${this.version}${this.previousHash}${this.merkleRoot}${this.transactionSize}${this.timestamp}${this.index}${this.nonce}`,
    );
  }
}
