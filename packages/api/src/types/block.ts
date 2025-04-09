import { MintOrTxSerialize } from '@ph-blockchain/block';
import { PaginationData } from './pagination';

export type BlockHeightQuery = {
  page?: number;
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

export type BlockTransactionResult = PaginationData<
  MintOrTxSerialize,
  { nextTxIndex: string; lastHeight: string }
>;
