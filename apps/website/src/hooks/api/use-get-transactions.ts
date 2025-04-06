import { getQueryClient } from '@/lib/query-client';
import { Block } from '@ph-blockchain/api';
import {
  BlockTransactionQuery,
  BlockTransactionResult,
} from '@ph-blockchain/api/src/types/block';
import { Transaction } from '@ph-blockchain/block';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetTransactionsQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: BlockTransactionQuery;
}) => {
  await queryClient.prefetchQuery({
    queryKey: ['block', 'transactions'],
    queryFn: () => Block.getTransactions(data),
  });
  return queryClient;
};

export const getTransactionsAdapter = (response: {
  data: Pick<BlockTransactionResult, 'transactions'>;
}) => {
  const { data } = response;

  return data.transactions.map((value) => ({
    ...value,
    displayAmount: `${(
      BigInt(value.amount) / Transaction.TX_CONVERSION_UNIT
    ).toString()} PESO`,
    viewLink: `/transaction/${value.transactionId}`,
  }));
};

export const useGetTransactionsQuery = (data: BlockTransactionQuery) => {
  return useQuery({
    queryKey: ['block', 'transactions'],
    queryFn: () => Block.getTransactions(data),
    select: getTransactionsAdapter,
  });
};
