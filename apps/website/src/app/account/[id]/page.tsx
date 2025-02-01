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
import { Account } from '@ph-blockchain/api';
import { Transform } from '@ph-blockchain/transformer';

export type AccountProps = {
  params: Promise<{ id: string }>;
};
export default async function AccountPage({ params }: AccountProps) {
  const accountId = (await params).id;
  const accountData = (await Account.getAccount(accountId)).data;

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>Account Address: {accountData.address}</Typography>
            </CardTitle>
            <CardDescription>
              <Typography>Nonce: {accountData.nonce}</Typography>
              <Typography>Transactions: {accountData.size}</Typography>

              <Typography as="p" className="mt-4 font-bold text-lg">
                Balance: {Transform.toHighestUnit(accountData.amount)} PESO
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
