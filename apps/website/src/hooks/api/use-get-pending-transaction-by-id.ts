import { getQueryClient } from '@/lib/query-client';
import { Mempool } from '@ph-blockchain/api';
import { SerializedTransaction } from '@ph-blockchain/api/src/types/transaction';
import { Transaction } from '@ph-blockchain/block';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetPendingTransactionByIdQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: {
    hash: string;
  };
}) => {
  await queryClient.prefetchQuery({
    queryKey: ['mempool', data.hash],
    queryFn: () => Mempool.getPendingTxById(data.hash),
  });
  return queryClient;
};

const adapter = (data: SerializedTransaction) => {
  return {
    ...data,
    displayAmount: `${(
      BigInt(data.amount) / Transaction.TX_CONVERSION_UNIT
    ).toString()} PESO`,
    viewLink: `/mempool/${data.transactionId}`,
  };
};

export const useGetPendingTransactionByIdQuery = (txHash: string) => {
  return useQuery({
    queryKey: ['mempool', txHash],
    queryFn: () => Mempool.getPendingTxById(txHash),
    select: adapter,
  });
};
