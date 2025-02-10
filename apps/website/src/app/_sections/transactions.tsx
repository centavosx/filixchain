'use client';

import { TransactionTable } from '@/components/app/transaction-table';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { useNewBlock } from '@/hooks/use-new-block';
import { MintOrTxSerialize } from '@ph-blockchain/block';
import { useEffect, useState } from 'react';

export type BlockSectionProps = {
  txs: MintOrTxSerialize[];
};
export const TransactionsSection = ({ txs: txsProp }: BlockSectionProps) => {
  const [txs, setTxs] = useState(txsProp);
  const { transactions } = useNewBlock();

  useEffect(() => {
    if (!transactions) return;
    setTxs((prev) => {
      const newTxs = [...transactions, ...prev];
      return newTxs.slice(0, 20);
    });
  }, [transactions]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <Label asChild>
        <Typography as="h4">Latest Transactions</Typography>
      </Label>
      <TransactionTable data={txs} />
    </div>
  );
};
