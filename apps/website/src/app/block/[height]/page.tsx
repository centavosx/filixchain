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
import { Block } from '@ph-blockchain/api';
import { Transform } from '@ph-blockchain/transformer';

export type BlockHeightProps = {
  params: Promise<{ height: string }>;
};
export default async function BlockHeight({ params }: BlockHeightProps) {
  const transactionHash = (await params).height;
  const transaction = (await Block.getTransactionById(transactionHash)).data;

  const isMint = !('fixedFee' in transaction);

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>Block</Typography>
            </CardTitle>
            <CardDescription>
              <Typography>Hash: {transaction.transactionId}</Typography>
              <Typography>Previous: {transaction.transactionId}</Typography>
              <Typography>Merkle: {transaction.transactionId}</Typography>
              <Typography>Target: {transaction.transactionId}</Typography>
              <Typography>
                Created:{' '}
                {Transform.date.formatToReadable(Number(transaction.timestamp))}
              </Typography>

              <Typography as="p" className="mt-4 font-bold text-lg">
                Transaction Size:{' '}
                {Transform.date.formatToReadable(Number(transaction.timestamp))}
              </Typography>
            </CardDescription>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent className="flex flex-row gap-8">
            <TransactionTable data={[]} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
