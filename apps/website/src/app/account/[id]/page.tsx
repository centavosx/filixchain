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
import { Transaction } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';

const MAX_LIMIT = 20;

export type AccountProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page: string | string[] }>;
};
export default async function AccountPage({
  params,
  searchParams,
}: AccountProps) {
  const accountId = (await params).id;
  const rawPage = (await searchParams)?.page;

  const accountData = (await Account.getAccount(accountId)).data;

  const currentPageString =
    (Array.isArray(rawPage)
      ? rawPage.find((value) => /\d+/.test(value))
      : rawPage) || '';
  const currentPage = +(currentPageString.match(/\d+/g)?.[0] || '1') || 1;
  const txSize = +accountData.size;
  const numberOfPages = Math.ceil(txSize / MAX_LIMIT);

  const accountTx = (
    await Account.getAccountTransaction(accountId, {
      end: txSize - (currentPage - 1) * MAX_LIMIT,
      reverse: true,
      limit: MAX_LIMIT,
    })
  ).data;

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>
                Account Address:{' '}
                {Transform.addPrefix(accountData.address, Transaction.prefix)}
              </Typography>
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
            <TransactionTable
              data={accountTx}
              pagination={{
                maxPage: numberOfPages,
                currentPage: currentPage,
              }}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
