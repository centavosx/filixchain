import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { TransactionTable } from '@/components/app/transaction-table';
import { Block } from '@ph-blockchain/api';

export default async function Home() {
  const { data: health } = await Block.getHealth();
  const { data: block } = await Block.getBlocks({ limit: 3, reverse: true });
  const { data: result } = await Block.getTransactions({
    limit: 50,
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
                {health.totalSupply} / {health.maxSupply}
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
        <div className="flex flex-col gap-4">
          <Label asChild>
            <Typography as="h4">Latest Blocks</Typography>
          </Label>
          {block.map((value) => (
            <Card className="shadow-xl" key={value.blockHash}>
              <CardHeader className="gap-2">
                <CardTitle>Block #{value.height}</CardTitle>
                <CardDescription className="flex flex-col gap-2">
                  <Typography className="text-wrap break-all" as="muted">
                    Hash:
                    {value.blockHash}
                  </Typography>
                  <Typography as="small">
                    Created: January 25, 2025 10:00 PM
                  </Typography>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Typography className="text-wrap break-all" as="muted">
                  Previous: {value.previousHash}
                </Typography>
                <Typography className="text-wrap break-all" as="muted">
                  Merkle: {value.merkleRoot}
                </Typography>
                <Typography className="text-wrap break-all" as="muted">
                  Target: {value.targetHash}
                </Typography>
                <Typography as="large">
                  Transactions: {value.transactionSize}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Label asChild>
            <Typography as="h4">Latest Transactions</Typography>
          </Label>
          <TransactionTable data={transactions} />
        </div>
      </section>
    </div>
  );
}
