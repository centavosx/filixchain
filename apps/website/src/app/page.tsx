import { prefetchGetBlockHealthQuery } from '@/hooks/api/use-get-block-health';
import { prefetchGetBlocksQuery } from '@/hooks/api/use-get-blocks';
import { prefetchGetTransactionsQuery } from '@/hooks/api/use-get-transactions';
import HomePage from '@/screens/home';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Home() {
  const queryClient = await prefetchGetBlockHealthQuery({});

  await prefetchGetBlocksQuery({
    queryClient,
    data: {
      limit: 3,
      reverse: true,
    },
  });

  await prefetchGetTransactionsQuery({
    queryClient,
    data: {
      query: {
        limit: 20,
        reverse: true,
      },
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomePage />
    </HydrationBoundary>
  );
}
