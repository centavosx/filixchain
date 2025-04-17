'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Typography } from '@/components/ui/typography';
import { useAuthStore } from '@/hooks/use-auth';
import { SignAccount } from '@/lib/wallet/account';
import { useEffect, useState } from 'react';
import { TransactionDialog } from '../transaction-dialog';
import { useUserAccountStore } from '@/hooks/use-user-account';
import { Transform } from '@ph-blockchain/transformer';

export const Account = () => {
  const [signedAccount, setSignedAccount] = useState<SignAccount>();
  const { account, logout } = useAuthStore();
  const { account: blockAccount } = useUserAccountStore();

  useEffect(() => {
    setSignedAccount(account?.getSignedAccount(0));
  }, [account]);

  if (!signedAccount) return null;

  return (
    <SheetContent className="flex flex-col gap-4">
      <SheetHeader>
        <SheetTitle>Account</SheetTitle>
      </SheetHeader>

      <Separator />

      <div className="flex flex-col gap-2">
        <Typography as="large">Wallet address</Typography>
        <Typography as="small">{signedAccount.walletAddress}</Typography>
      </div>

      <Separator />

      {!!blockAccount && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Typography as="muted">Amount</Typography>
            <Typography as="small">
              {Transform.toHighestUnit(blockAccount.amount)} PESO
            </Typography>
          </div>
          <div className="flex flex-col gap-2">
            <Typography as="muted">Nonce</Typography>
            <Typography as="small">{blockAccount.nonce}</Typography>
          </div>
          <div className="flex flex-col gap-2">
            <Typography as="muted">Transactions</Typography>
            <Typography as="small">{blockAccount.size}</Typography>
          </div>
        </div>
      )}

      <SheetFooter>
        <TransactionDialog />
        <Button onClick={logout}>Logout</Button>
      </SheetFooter>
    </SheetContent>
  );
};
