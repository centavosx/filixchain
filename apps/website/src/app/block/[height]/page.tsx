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
import { Minter, Transaction } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';

export type BlockHeightProps = {
  params: Promise<{ height: string }>;
};
export default async function BlockHeight({ params }: BlockHeightProps) {
  const height = (await params).height;
  const block = (await Block.getBlockByHeight(height)).data;

  const transactions =
    block.transactions?.map((encoded) => {
      const mintOrTx =
        encoded.length === Minter.ENCODED_SIZE
          ? Minter.decode(encoded)
          : Transaction.decode(encoded);

      return mintOrTx.serialize();
    }) ?? [];

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>Block Height: {block.height}</Typography>
            </CardTitle>
            <CardDescription>
              <Typography>Hash: {block.blockHash}</Typography>
              <Typography>Previous: {block.previousHash}</Typography>
              <Typography>Merkle: {block.merkleRoot}</Typography>
              <Typography>Target: {block.targetHash}</Typography>
              <Typography>
                Created:{' '}
                {Transform.date.formatToReadable(Number(block.timestamp))}
              </Typography>

              <Typography as="p" className="mt-4 font-bold text-lg">
                Transaction Size: {block.transactionSize}
              </Typography>
            </CardDescription>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent className="flex flex-row gap-8">
            <TransactionTable data={transactions} shouldExcludeBlock />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
