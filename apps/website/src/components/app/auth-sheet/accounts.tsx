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

export const Accounts = () => {
  const [signedAccount, setSignedAccount] = useState<SignAccount>();
  const { account, logout } = useAuthStore();

  useEffect(() => {
    setSignedAccount(account?.getSignedAccount(0));
  }, [account]);

  if (!signedAccount) return null;

  return (
    <SheetContent className="flex flex-col gap-8">
      <SheetHeader>
        <SheetTitle>Account</SheetTitle>
      </SheetHeader>

      <Separator />

      <div className="flex flex-col gap-2">
        <Typography as="large">Wallet address</Typography>
        <Typography as="small">{signedAccount.walletAddress}</Typography>
      </div>

      <SheetFooter>
        <TransactionDialog />
        <Button onClick={logout}>Logout</Button>
      </SheetFooter>
    </SheetContent>
  );
};
