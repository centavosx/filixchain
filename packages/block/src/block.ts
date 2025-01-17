import { AppHash } from '@ph-blockchain/hash';
import { Transaction } from './transaction';

export class Block {
  public readonly size = 1000000;

  readonly genesisHash =
    '0000000000000000000000000000000000000000000000000000000000000000';

  readonly version: string;
  readonly index: number;
  readonly timestamp: number;
  readonly transactions = new Set<string>();
  readonly previousHash: string | null;

  private readonly isGenesis: boolean;

  nonce: number;

  constructor(
    version: string,
    index: number,
    timestamp: number,
    transactions: string[],
    nonce: number,
    previousHash?: string,
  ) {
    this.isGenesis = !!previousHash;
    this.version = version;
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = new Set(transactions);
    this.previousHash = previousHash ?? this.genesisHash;
    this.nonce = nonce;
  }

  public get merkleRoot() {
    return AppHash.generateMerkleRoot(Array.from(this.transactions.values()));
  }

  public get transactionSize() {
    return this.transactions.size;
  }

  public get blockHash() {
    return this.isGenesis
      ? this.genesisHash
      : AppHash.createSha256Hash(
          `${this.version}${this.previousHash}${this.merkleRoot}${this.transactionSize}${this.timestamp}${this.index}${this.nonce}`,
        );
  }

  public decodeTransactions() {
    return Array.from(this.transactions.values()).map((value) =>
      Transaction.decode(value),
    );
  }
}
