import { getQueryClient } from '@/lib/query-client';
import { Block } from '@ph-blockchain/api';
import { MintOrTxSerialize } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetTransactionByIdQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: {
    hash: string;
  };
}) => {
  await queryClient.prefetchQuery({
    queryKey: ['blocks', 'transactions', data.hash],
    queryFn: () => Block.getTransactionById(data.hash),
  });
  return queryClient;
};

export const getGetTransactionByIdQueryAdapter = (response: {
  data: MintOrTxSerialize;
}) => {
  const { data } = response;
  return {
    ...data,
    displayCreated: Transform.date.formatToReadable(Number(data.timestamp)),
    displayAmount: `${Transform.toHighestUnit(data.amount)} PESO`,
    mintData:
      'fixedFee' in data
        ? {
            displayFixedFee: `${Transform.toHighestUnit(data.fixedFee)} PESO`,
          }
        : undefined,
  };
};

export const useGetTransactionByIdQueryQuery = (txHash: string) => {
  return useQuery({
    queryKey: ['blocks', 'transactions', txHash],
    queryFn: () => Block.getTransactionById(txHash),
    select: getGetTransactionByIdQueryAdapter,
  });
};
