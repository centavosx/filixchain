import { getQueryClient } from '@/lib/query-client';
import { UiMapper } from '@/lib/ui-mapper';
import { Block } from '@ph-blockchain/api';
import {
  BlockTransactionQuery,
  BlockTransactionResult,
} from '@ph-blockchain/api/src/types/block';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetTransactionsQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: {
    query: BlockTransactionQuery;
  };
}) => {
  await queryClient.prefetchQuery({
    queryKey: [
      'block',
      'transactions',
      data.query.limit,
      data.query.lastBlockHeight,
      data.query.reverse,
      data.query.nextTxIndex,
    ],
    queryFn: () => Block.getTransactions(data.query),
  });
  return queryClient;
};

export const getTransactionsAdapter = ({
  data,
  ...rest
}: BlockTransactionResult) => {
  return {
    ...rest,
    data: UiMapper.transactions(data),
  };
};

export const useGetTransactionsQuery = (query: BlockTransactionQuery) => {
  return useQuery({
    queryKey: [
      'block',
      'transactions',
      query.limit,
      query.lastBlockHeight,
      query.reverse,
      query.nextTxIndex,
    ],
    queryFn: () => Block.getTransactions(query),
    select: getTransactionsAdapter,
  });
};
