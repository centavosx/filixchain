import { prefetchGetMempoolQuery } from '@/hooks/api/use-get-mempool';
import MempoolScreen from '@/screens/mempool';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export default async function Mempool() {
  const queryClient = await prefetchGetMempoolQuery({});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MempoolScreen />
    </HydrationBoundary>
  );
}
