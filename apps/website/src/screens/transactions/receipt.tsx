'use client';

import { DisplayMemo } from '@/components/app/display-memo';
import { FeeToolTip } from '@/components/app/fee-tooltip';
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
                  {!data?.mintData ? 'Minted To' : 'To'}:
                </Typography>
                <Typography as="large">{data?.to}</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">Nonce:</Typography>
                <Typography as="large">{data?.nonce}</Typography>
              </div>
              <Separator />
              {!!data && 'memo' in data && !!data.memo && (
                <>
                  <DisplayMemo rawMemo={data.memo} />
                  <Separator />
                </>
              )}
              <div className="flex flex-col gap-2">
                <Typography as="large">Amount:</Typography>
                <Typography as="h3">{data?.displayAmount}</Typography>
              </div>
              {!!data?.mintData && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2 items-center">
                    <Typography as="large">Fee:</Typography>
                    <FeeToolTip />
                  </div>
                  <Typography as="small">{data.mintData.displayFee}</Typography>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
