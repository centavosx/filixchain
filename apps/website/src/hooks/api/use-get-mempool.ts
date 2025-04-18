import { Defaults } from '@/constants/defaults';
import { getQueryClient } from '@/lib/query-client';
import { Mempool } from '@ph-blockchain/api';
import { SerializedTransaction } from '@ph-blockchain/api/src/types/transaction';
import { Transform } from '@ph-blockchain/transformer';
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
      displayAmount: `${Transform.toHighestUnit(value.amount)} ${Defaults.nativeCoinName}`,
      displayFee: `${Transform.toHighestUnit(Number(value.fixedFee) + Number(value.additionalFee))} ${Defaults.nativeCoinName}`,
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
