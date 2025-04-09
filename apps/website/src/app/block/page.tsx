import { Defaults } from '@/constants/defaults';
import { prefetchGetBlocksQuery } from '@/hooks/api/use-get-blocks';
import { searchParamParser } from '@/lib/search-param-parser';
import BlocksScreen from '@/screens/blocks';

import { Page } from '@/type/page';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Blocks({
  searchParams,
}: Page<unknown, { page: string; limit: string; reverse: string }>) {
  const awaitedSearchParams = await searchParams;

  const page = searchParamParser({
    key: 'page',
    searchParams: awaitedSearchParams,
    transformer: Number,
    validator: (value) => isFinite(value) && value > 0,
    fallback: 1,
  });

  const reverse = searchParamParser({
    key: 'reverse',
    searchParams: awaitedSearchParams,
    transformer: (value) => (!value ? true : value.toLowerCase() === 'true'),
    fallback: true,
  });

  const limit = searchParamParser({
    key: 'limit',
    searchParams: awaitedSearchParams,
    transformer: (value) => {
      if (!value) return Defaults.defaultLimit;
      return Number(value);
    },
    validator: (value) =>
      isFinite(value) && value > 0 && value <= Defaults.maxLimit,
    fallback: Defaults.maxLimit,
  });

  const query = { page, limit, reverse };

  const queryClient = await prefetchGetBlocksQuery({
    data: query,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlocksScreen {...query} />
    </HydrationBoundary>
  );
}
