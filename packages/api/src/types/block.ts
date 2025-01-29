import { MintOrTxSerialize } from '@ph-blockchain/block';

export type BlockHeightQuery = {
  start?: number;
  end?: number;
  reverse?: boolean;
  limit?: number;
  includeTx?: boolean;
};

export type BlockTransactionQuery = {
  lastBlockHeight?: number;
  nextTxIndex?: number;
  reverse?: boolean;
  limit?: number;
};

export type BlockHealthResult = {
  totalSupply: string;
  maxSupply: string;
  txSize: string;
  blocks: string;
};

export type BlockTransactionResult = {
  transactions: MintOrTxSerialize[];
  nextTxIndex: string;
  lastHeight: string;
};
