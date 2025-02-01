export type GetAccountResult = {
  address: string;
  nonce: string;
  amount: string;
  size: string;
};

export type AccountTransactionSearchDto = {
  start?: number;
  end?: number;
  limit?: number;
  reverse?: boolean;
  from?: string;
  to?: string;
};
