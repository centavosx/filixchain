export type BlockHeightQuery = {
  start?: number;
  end?: number;
  reverse?: boolean;
  limit?: number;
  includeTx?: boolean;
};

export type BlockHealthResult = {
  totalSupply: string;
  maxSupply: string;
  txSize: string;
  blocks: string;
};
