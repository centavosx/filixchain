import { getQueryClient } from '@/lib/query-client';
import { UiMapper } from '@/lib/ui-mapper';
import { Block } from '@ph-blockchain/api';
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

export const useGetTransactionByIdQueryQuery = (txHash: string) => {
  return useQuery({
    queryKey: ['blocks', 'transactions', txHash],
    queryFn: () => Block.getTransactionById(txHash),
    select: UiMapper.transaction,
  });
};
