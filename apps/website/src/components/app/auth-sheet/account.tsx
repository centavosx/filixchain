'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Typography } from '@/components/ui/typography';
import { useAuthStore } from '@/hooks/use-auth';
import { SignAccount } from '@/lib/wallet/account';
import { useEffect, useMemo, useState } from 'react';
import { TransactionDialog } from '../transaction-dialog';
import { useUserAccountStore } from '@/hooks/use-user-account';
import { Transform } from '@ph-blockchain/transformer';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { Defaults } from '@/constants/defaults';

export const Account = () => {
  const [shouldShowKey, setShouldShowKey] = useState(false);
  const [signedAccount, setSignedAccount] = useState<SignAccount>();
  const { account, logout } = useAuthStore();
  const { account: blockAccount, pendingTxs } = useUserAccountStore();

  useEffect(() => {
    setSignedAccount(account?.getSignedAccount(0));
  }, [account]);

  const usedAmount = useMemo(() => {
    return pendingTxs.reduce(
      (accumulator, value) =>
        accumulator + Number(value.amount) + Number(value.fixedFee),
      0,
    );
  }, [pendingTxs]);

  const availableAmount =
    (blockAccount?.amount ? Number(blockAccount?.amount) : 0) - usedAmount;

  const currentNonce =
    (blockAccount?.nonce ? Number(blockAccount.nonce) : 0) + pendingTxs.length;

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

      {!!blockAccount && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Typography as="muted">Amount</Typography>
            <Typography as="small">
              {Transform.toHighestUnit(blockAccount.amount)}{' '}
              {Defaults.nativeCoinName}
            </Typography>
          </div>
          <div className="flex flex-col gap-2">
            <Typography as="muted">Used Amount</Typography>
            <Typography as="small">
              {Transform.toHighestUnit(usedAmount)} {Defaults.nativeCoinName}
            </Typography>
          </div>
          <div className="flex flex-col gap-2">
            <Typography as="muted">Available Amount</Typography>
            <Typography as="small">
              {Transform.toHighestUnit(availableAmount)}{' '}
              {Defaults.nativeCoinName}
            </Typography>
          </div>
          <div className="flex flex-col gap-2">
            <Typography as="muted">Nonce</Typography>
            <Typography as="small">{currentNonce}</Typography>
          </div>
          <div className="flex flex-col gap-2">
            <Typography as="muted">Transactions</Typography>
            <Typography as="small">{blockAccount.size}</Typography>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
        <TransactionDialog />
        <Button onClick={logout}>Logout</Button>
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <Typography as="large">
          {account?.isMnemonic ? 'Recovery Phrase' : 'Recovery Key'}
        </Typography>
        <Typography as="small">
          {shouldShowKey ? account?.mnemonicOrKey : '******************'}
        </Typography>
        <div className="flex space-x-2 py-2 items-center">
          <Checkbox
            id="show-mnemonic"
            checked={shouldShowKey}
            onCheckedChange={(checked) => {
              setShouldShowKey(Boolean(checked));
            }}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="show-mnemonic"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Show
            </label>
          </div>
        </div>
      </div>

      <Separator />

      {!!pendingTxs.length && (
        <div className="flex flex-col gap-2">
          <Typography as="large">Pending Transactions</Typography>

          {pendingTxs.map((value) => (
            <Alert key={value.transactionId}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle className="break-words">
                <b>Hash</b>: {value.transactionId}
              </AlertTitle>
              <AlertDescription>
                <b>Nonce</b>: {value.nonce}
              </AlertDescription>
              <AlertDescription>
                <b>From</b>: {value.from}
              </AlertDescription>
              <AlertDescription>
                <b>To</b>: {value.to}
              </AlertDescription>
              <AlertDescription>
                <b>Amount</b>: {value.displayAmount}
              </AlertDescription>
              <AlertDescription>
                <b>Fee</b>: {value.displayFee}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </SheetContent>
  );
};
