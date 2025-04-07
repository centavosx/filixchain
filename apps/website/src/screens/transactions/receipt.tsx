'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { useGetTransactionByIdQueryQuery } from '@/hooks/api/use-get-transaction-by-id';
import { useParams } from 'next/navigation';

export default function TransactionReceiptScreen() {
  const params = useParams<{ id: string }>();
  const transactionHash = params.id;

  const { data } = useGetTransactionByIdQueryQuery(transactionHash);

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>Transaction Receipt</Typography>
            </CardTitle>
            <CardDescription>
              <Typography>Hash: {data?.transactionId}</Typography>
              <Typography>Created: {data?.displayCreated}</Typography>
            </CardDescription>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent className="flex flex-row gap-8">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Typography as="muted">Block Height:</Typography>
                <Typography as="large">#{data?.blockHeight}</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">From:</Typography>
                <Typography as="large">{data?.from}</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">
                  {!!data?.mintData ? 'Minted By' : 'To'}:
                </Typography>
                <Typography as="large">{data?.to}</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">Nonce:</Typography>
                <Typography as="large">{data?.nonce}</Typography>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Typography as="large">Amount:</Typography>
                <Typography as="h3">{data?.displayAmount}</Typography>
              </div>
              {!!data?.mintData && (
                <div className="flex flex-col gap-2">
                  <Typography as="muted">Fee:</Typography>
                  <Typography as="large">
                    {data.mintData.displayFixedFee}
                  </Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
