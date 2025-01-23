export type RawBlock = {
  readonly version: string;
  readonly height: number;
  readonly timestamp?: number;
  readonly transactions: string[];
  readonly previousHash: string;
  readonly targetHash: string;
  readonly blockHash: string;
  readonly nonce: number;
  readonly merkleRoot: string;
  readonly transactionSize: number;
};

export type RawBlockDb = {
  mintId?: string;
  version: string;
  height: string;
  timestamp: string;
  transactions: string[];
  previousHash: string;
  targetHash: string;
  blockHash: string;
  nonce: string;
  merkleRoot: string;
  transactionSize: number;
};

export type BlockHeightQuery = {
  from?: number;
  to?: number;
  reverse?: boolean;
  limit?: number;
};
