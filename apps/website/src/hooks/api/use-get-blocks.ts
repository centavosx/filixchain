import { getQueryClient } from '@/lib/query-client';
import { UiMapper } from '@/lib/ui-mapper';
import { Block } from '@ph-blockchain/api';
import { BlockHeightQuery } from '@ph-blockchain/api/src/types/block';
import { PaginationData } from '@ph-blockchain/api/src/types/pagination';
import { RawBlock } from '@ph-blockchain/block';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetBlocksQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: BlockHeightQuery;
}) => {
  await queryClient.prefetchQuery({
    queryKey: [
      'blocks',
      data.page,
      data.limit,
      data.includeTx,
      data.reverse,
      data.start,
      data.end,
    ],
    queryFn: () => Block.getBlocks(data),
  });
  return queryClient;
};

export const getBlocksQueryAdapter = ({
  data,
  totalPages,
}: PaginationData<RawBlock>) => {
  return {
    totalPages,
    data: UiMapper.blocks(data),
  };
};

export const useGetBlocksQuery = (data: BlockHeightQuery) => {
  return useQuery({
    queryKey: [
      'blocks',
      data.page,
      data.limit,
      data.includeTx,
      data.reverse,
      data.start,
      data.end,
    ],
    queryFn: () => Block.getBlocks(data),
    select: getBlocksQueryAdapter,
  });
};
