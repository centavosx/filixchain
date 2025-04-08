'use client';

import { useAuthStore } from '@/hooks/use-auth';
import { useUserAccountStore } from '@/hooks/use-user-account';
import { Account, Events } from '@ph-blockchain/api';
import { useEffect, useRef } from 'react';
import { Transform } from '@ph-blockchain/transformer';
import { Minter, Transaction } from '@ph-blockchain/block';
import { toast } from 'sonner';
import { useApi } from '@/hooks/use-api';

Events.connect('ws://localhost:3002');
Events.createConnectionListener(() => console.log('CONNECTED'));
Events.createErrorListener((e) => console.log(e));

export const Listeners = () => {
  const txListenerRef = useRef<() => void>(null);
  const leaveAccountRef = useRef<() => void>(null);

  const { account, storedAccount } = useAuthStore();
  const { setAccount } = useUserAccountStore();
  const { executeApi: getAccount, data } = useApi(Account.getAccount);

  useEffect(() => {
    if (!account) return;

    const signedAccountAddress = account.getSignedAccount(0).walletAddress;
    const rawAddress = Transform.removePrefix(
      signedAccountAddress,
      Transaction.prefix,
    );

    getAccount(rawAddress);

    const off = Events.createAccountInfoListener((value) => {
      if (value.address === rawAddress) {
        setAccount(value);
      }
    });

    if (!txListenerRef.current) {
      leaveAccountRef.current = Events.subscribeAccount(rawAddress);
      txListenerRef.current = Events.createTransactionListener((data) => {
        const isReceive = data.to === signedAccountAddress;
        const isSent = data.from === signedAccountAddress;
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
  }, [account, setAccount, getAccount]);

  useEffect(() => {
    txListenerRef.current?.();
    txListenerRef.current = null;
    leaveAccountRef.current?.();
    leaveAccountRef.current = null;
  }, [storedAccount]);

  useEffect(() => {
    if (!data) return;
    setAccount(data.data);
  }, [data, setAccount]);

  return null;
};
