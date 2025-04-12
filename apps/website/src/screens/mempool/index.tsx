'use client';

import { TransactionTable } from '@/components/app/transaction-table';
import { Typography } from '@/components/ui/typography';
import { useGetMempoolQuery } from '@/hooks/api/use-get-mempool';
import { UiMapper } from '@/lib/ui-mapper';

export default function MempoolScreen() {
  const { data: transactions } = useGetMempoolQuery();

  return (
    <div className="flex flex-col p-6 gap-8">
      <Typography as="h4">Mempool</Typography>
      <TransactionTable
        data={
          (transactions?.data ?? []) as ReturnType<
            (typeof UiMapper)['transactions']
          >
        }
        shouldExcludeBlock
      />
    </div>
  );
}
