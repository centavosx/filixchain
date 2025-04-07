import { prefetchGetTransactionByIdQuery } from '@/hooks/api/use-get-transaction-by-id';
import { Page } from '@/type/page';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import TransactionReceiptScreen from '@/screens/transactions/receipt';

export type TransactionReceiptProps = Page<{ id: string }>;
export default async function TransactionReceipt({
  params,
}: TransactionReceiptProps) {
  const transactionHash = (await params).id;
  const queryClient = await prefetchGetTransactionByIdQuery({
    data: {
      hash: transactionHash,
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransactionReceiptScreen />
    </HydrationBoundary>
  );
}
