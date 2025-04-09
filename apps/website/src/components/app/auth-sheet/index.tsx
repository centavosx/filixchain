'use client';

import { User } from 'lucide-react';
import { Sheet, SheetTrigger } from '../../ui/sheet';

import { useAuthStore } from '@/hooks/use-auth';
import { useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Accounts } from './accounts';
import { LoginSheetContent } from './login';
import { RegisterSheetContent } from './register';
import { Transform } from '@ph-blockchain/transformer';
import { Minter, Transaction } from '@ph-blockchain/block';
import { useGetAccountByIdQuery } from '@/hooks/api/use-get-account-by-id';
import { Events } from '@ph-blockchain/api';
import { useUserAccountStore } from '@/hooks/use-user-account';

export const AuthSheet = () => {
  const txListenerRef = useRef<() => void>(null);
  const leaveAccountRef = useRef<() => void>(null);

  const { storedAccount, account, logout } = useAuthStore();
  const { setAccount } = useUserAccountStore();

  const rawAddress = useMemo(() => {
    if (!account) return '';
    const signedAccountAddress = account.getSignedAccount(0).walletAddress;
    return Transform.removePrefix(signedAccountAddress, Transaction.prefix);
  }, [account]);

  const { data: fetchedAccount } = useGetAccountByIdQuery(
    rawAddress,
    !rawAddress,
  );

  useEffect(() => {
    if (!account) return;

    const timeoutId = setTimeout(() => {
      logout();
      toast.error('Session ended. Re-login again to use your account.');
    }, 180000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [account, logout]);

  useEffect(() => {
    if (!fetchedAccount) return;

    setAccount({
      size: fetchedAccount.size?.toString(),
      nonce: fetchedAccount.nonce,
      address: fetchedAccount.address,
      amount: fetchedAccount.amount,
    });

    const off = Events.createAccountInfoListener((value) => {
      if (value.address === rawAddress) {
        setAccount(value);
      }
    });

    if (!txListenerRef.current) {
      leaveAccountRef.current = Events.subscribeAccount(rawAddress);
      txListenerRef.current = Events.createTransactionListener((data) => {
        const isReceive = data.to === fetchedAccount.address;
        const isSent = data.from === fetchedAccount.address;
        if (isReceive || isSent) {
          toast.success(
            `${isReceive ? (data.from === Minter.address ? 'Minted' : 'Received') : 'Sent'} ${Transform.toHighestUnit(data.amount)} PESO`,
          );
        }
      });
    }
    return () => {
      off();
    };
  }, [fetchedAccount, setAccount, rawAddress]);

  useEffect(() => {
    txListenerRef.current?.();
    txListenerRef.current = null;
    leaveAccountRef.current?.();
    leaveAccountRef.current = null;
  }, [storedAccount]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <User />
        </Button>
      </SheetTrigger>

      {!account ? (
        !!storedAccount ? (
          <LoginSheetContent />
        ) : (
          <RegisterSheetContent />
        )
      ) : (
        <Accounts />
      )}
    </Sheet>
  );
};
