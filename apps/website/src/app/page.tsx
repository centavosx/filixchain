import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { Block } from '@ph-blockchain/api';
import { Transform } from '@ph-blockchain/transformer';
import { BlockSection } from './_sections/block';
import { TransactionsSection } from './_sections/transactions';

export default async function Home() {
  const { data: health } = await Block.getHealth();
  const { data: blocks } = await Block.getBlocks({ limit: 3, reverse: true });
  const { data: result } = await Block.getTransactions({
    limit: 20,
    reverse: true,
  });
  const transactions = result.transactions;

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardContent className="flex flex-col md:flex-row gap-8 justify-between md:items-center p-6">
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <Typography as="h3">Supply</Typography>
              <Separator />
              <Typography as="lead">
                {Transform.toHighestUnit(health.totalSupply)} /{' '}
                {Transform.toHighestUnit(health.maxSupply)}
              </Typography>
            </div>
            {/* <Separator className="h-20" orientation="vertical" /> */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <Typography as="h3">Blocks</Typography>
              <Separator />
              <Typography as="lead">{health.blocks}</Typography>
            </div>
            {/* <Separator className="h-20" orientation="vertical" /> */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <Typography as="h3">Transactions</Typography>
              <Separator />
              <Typography as="lead">{health.txSize}</Typography>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="flex flex-1 gap-8 flex-col xl:flex-row">
        <BlockSection blocks={blocks} />
        <TransactionsSection txs={transactions} />
      </section>
    </div>
  );
}
