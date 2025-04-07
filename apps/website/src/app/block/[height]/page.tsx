import { prefetchGetBlockByHeightQuery } from '@/hooks/api/use-get-block-by-height';
import BlockHeightScreen from '@/screens/blocks/height';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export type BlockHeightProps = {
  params: Promise<{ height: string }>;
};
export default async function BlockHeight({ params }: BlockHeightProps) {
  const height = (await params).height;
  const queryClient = await prefetchGetBlockByHeightQuery({
    data: {
      height,
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <BlockHeightScreen />
    </HydrationBoundary>
  );
}
