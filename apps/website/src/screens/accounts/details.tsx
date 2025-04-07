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
import { useGetAccountByIdQuery } from '@/hooks/api/use-get-account-by-id';
import { useGetAccountTransactionsQuery } from '@/hooks/api/use-get-account-transactions';
import { useParams } from 'next/navigation';

export type AccountPageProps = {
  page: number;
  end: number;
  reverse: boolean;
  limit: number;
  numberOfPages: number;
};
export default function AccountDetailsScreen({
  page,
  numberOfPages,
  end,
  reverse,
  limit,
}: AccountPageProps) {
  const params = useParams<{ id: string }>();
  const accountId = params.id;

  const { data: accountData } = useGetAccountByIdQuery(accountId);
  const { data: accountTx } = useGetAccountTransactionsQuery(accountId, {
    end,
    reverse,
    limit,
  });

  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>
                Account Address: {accountData?.displayAddress}
              </Typography>
            </CardTitle>
            <CardDescription>
              <Typography>Nonce: {accountData?.nonce}</Typography>
              <Typography>Transactions: {accountData?.size}</Typography>

              <Typography as="p" className="mt-4 font-bold text-lg">
                Balance: {accountData?.displayBalance}
              </Typography>
            </CardDescription>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent className="flex flex-row gap-8">
            <TransactionTable
              data={accountTx ?? []}
              pagination={{
                maxPage: numberOfPages,
                currentPage: page,
              }}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
