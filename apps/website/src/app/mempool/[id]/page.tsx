import { prefetchGetPendingTransactionByIdQuery } from '@/hooks/api/use-get-pending-transaction-by-id';
import PendingTransactionReceiptScreen from '@/screens/mempool/receipt';
import { Page } from '@/type/page';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export type PendingTransactionReceiptProps = Page<{ id: string }>;
export default async function PendingTransactionReceipt({
  params,
}: PendingTransactionReceiptProps) {
  const transactionHash = (await params).id;

  const queryClient = await prefetchGetPendingTransactionByIdQuery({
    data: {
      hash: transactionHash,
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PendingTransactionReceiptScreen />
    </HydrationBoundary>
  );
}
