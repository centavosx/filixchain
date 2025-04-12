import { getQueryClient } from '@/lib/query-client';
import { Mempool } from '@ph-blockchain/api';
import { SerializedTransaction } from '@ph-blockchain/api/src/types/transaction';
import { Transaction } from '@ph-blockchain/block';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetMempoolQuery = async ({
  queryClient = getQueryClient(),
}: {
  queryClient?: QueryClient;
}) => {
  await queryClient.prefetchQuery({
    queryKey: ['mempool'],
    queryFn: () => Mempool.getMempool(),
  });
  return queryClient;
};

export const getTransactionsAdapter = ({
  data,
}: {
  data: SerializedTransaction[];
}) => {
  return {
    data: data.map((value) => ({
      ...value,
      displayAmount: `${(
        BigInt(value.amount) / Transaction.TX_CONVERSION_UNIT
      ).toString()} PESO`,
      viewLink: `/mempool/${value.transactionId}`,
    })),
  };
};

export const useGetMempoolQuery = () => {
  return useQuery({
    queryKey: ['mempool'],
    queryFn: () => Mempool.getMempool(),
    select: getTransactionsAdapter,
  });
};
