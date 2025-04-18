'use client';

import { TransactionTable } from '@/components/app/transaction-table';
import { Typography } from '@/components/ui/typography';
import { useGetMempoolQuery } from '@/hooks/api/use-get-mempool';
import { UiMapper } from '@/lib/ui-mapper';

export default function MempoolScreen() {
  const { data: transactions } = useGetMempoolQuery();

  return (
    <div className="flex flex-col p-6 gap-8">
      <div className="flex flex-col gap-2">
        <Typography as="h4">Mempool</Typography>
        <Typography as="muted">
          The mempool (short for memory pool) is a temporary storage area for
          unconfirmed transactions. When a transaction is submitted, it enters
          the mempool, where it waits to be picked up and included in a new
          block by miners.
        </Typography>
      </div>
      <TransactionTable
        data={
          (transactions?.data ?? []) as unknown as ReturnType<
            (typeof UiMapper)['transactions']
          >
        }
        shouldExcludeBlock
      />
    </div>
  );
}
