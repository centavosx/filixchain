import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { Block } from '@ph-blockchain/api';
import { Transform } from '@ph-blockchain/transformer';

export type TransactionReceiptProps = {
  params: Promise<{ id: string }>;
};
export default async function TransactionReceipt({
  params,
}: TransactionReceiptProps) {
  const transactionHash = (await params).id;
  const transaction = (await Block.getTransactionById(transactionHash)).data;

  const isMint = !('fixedFee' in transaction);

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>Transaction Receipt</Typography>
            </CardTitle>
            <CardDescription>
              <Typography>Hash: {transaction.transactionId}</Typography>
              <Typography>
                Created:{' '}
                {Transform.date.formatToReadable(Number(transaction.timestamp))}
              </Typography>
            </CardDescription>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent className="flex flex-row gap-8">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Typography as="muted">Block Height:</Typography>
                <Typography as="large">#{transaction.blockHeight}</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">From:</Typography>
                <Typography as="large">{transaction.from}</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">
                  {isMint ? 'Minted By' : 'To'}:
                </Typography>
                <Typography as="large">{transaction.to}</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">Nonce:</Typography>
                <Typography as="large">{transaction.nonce}</Typography>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Typography as="large">Amount:</Typography>
                <Typography as="h3">
                  {Transform.toHighestUnit(transaction.amount)} PESO
                </Typography>
              </div>
              {!isMint && (
                <div className="flex flex-col gap-2">
                  <Typography as="muted">Fee:</Typography>
                  <Typography as="large">
                    {Transform.toHighestUnit(transaction.fixedFee)} PESO
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
