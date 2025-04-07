'use client';

import { TransactionTable } from '@/components/app/transaction-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { useGetBlockByHeightQuery } from '@/hooks/api/use-get-block-by-height';
import { Transform } from '@ph-blockchain/transformer';
import { useParams } from 'next/navigation';

export default function BlockHeightScreen() {
  const params = useParams<{ height: string }>();
  const height = params.height;
  const { data: block } = useGetBlockByHeightQuery(height);

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>Block Height: {block?.height}</Typography>
            </CardTitle>
            <CardDescription>
              <Typography>Hash: {block?.blockHash}</Typography>
              <Typography>Previous: {block?.previousHash}</Typography>
              <Typography>Merkle: {block?.merkleRoot}</Typography>
              <Typography>Target: {block?.targetHash}</Typography>
              <Typography>
                Created:{' '}
                {Transform.date.formatToReadable(Number(block?.timestamp))}
              </Typography>

              <Typography as="p" className="mt-4 font-bold text-lg">
                Transaction Size: {block?.transactionSize}
              </Typography>
            </CardDescription>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent className="flex flex-row gap-8">
            <TransactionTable
              data={block?.transactions ?? []}
              shouldExcludeBlock
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
