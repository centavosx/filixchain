import { Defaults } from '@/constants/defaults';
import { getQueryClient } from '@/lib/query-client';
import { Mempool } from '@ph-blockchain/api';
import { SerializedTransaction } from '@ph-blockchain/api/src/types/transaction';
import { Transform } from '@ph-blockchain/transformer';
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

const adapter = (value: SerializedTransaction) => {
  return {
    ...value,
    displayAmount: `${Transform.toHighestUnit(
      value.amount,
    ).toString()} ${Defaults.nativeCoinName}`,
    displayFee: `${Transform.toHighestUnit(Number(value.fixedFee) + Number(value.additionalFee))} ${Defaults.nativeCoinName}`,
    viewLink: `/mempool/${value.transactionId}`,
  };
};

export const useGetPendingTransactionByIdQuery = (txHash: string) => {
  return useQuery({
    queryKey: ['mempool', txHash],
    queryFn: () => Mempool.getPendingTxById(txHash),
    select: adapter,
  });
};
