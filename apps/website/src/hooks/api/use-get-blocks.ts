import { getQueryClient } from '@/lib/query-client';
import { Block } from '@ph-blockchain/api';
import { BlockHeightQuery } from '@ph-blockchain/api/src/types/block';
import { RawBlock } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetBlocksQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: BlockHeightQuery;
}) => {
  await queryClient.prefetchQuery({
    queryKey: ['blocks'],
    queryFn: () => Block.getBlocks(data),
  });
  return queryClient;
};

export const getBlocksQueryAdapter = (response: { data: RawBlock[] }) => {
  const { data } = response;
  return data.map((value) => ({
    ...value,
    displayCreated: value.timestamp
      ? Transform.date.formatToReadable(value.timestamp)
      : undefined,
    viewLink: `/block/${value.height}`,
  }));
};

export const useGetBlocksQuery = (data: BlockHeightQuery) => {
  return useQuery({
    queryKey: ['blocks'],
    queryFn: () => Block.getBlocks(data),
    select: getBlocksQueryAdapter,
  });
};
