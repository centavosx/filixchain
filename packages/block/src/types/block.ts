export type RawBlock = {
  readonly version: string;
  readonly height: number;
  readonly timestamp?: number;
  readonly transactions?: string[];
  readonly previousHash: string;
  readonly targetHash: string;
  readonly blockHash: string;
  readonly nonce: number;
  readonly merkleRoot: string | null;
  readonly transactionSize: number;
};
