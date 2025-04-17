import { SerializedTransaction } from '@ph-blockchain/api/src/types/transaction';
import { Account } from '@ph-blockchain/block';
import { create } from 'zustand';

export type SerializedAccount = ReturnType<Account['serialize']>;

type PendingTx = SerializedTransaction & {
  displayAmount: string;
  displayFee: string;
};

export type UseUserAccount = {
  pendingTxs: PendingTx[];
  account?: SerializedAccount;
  setAccount: (value: SerializedAccount) => void;
  setPendingTxs: (txs: PendingTx[]) => void;
  removeTxById: (hash: string) => void;
};

export const useUserAccountStore = create<UseUserAccount>((set) => ({
  pendingTxs: [],
  account: undefined,
  setAccount: (updatedAccount) => {
    set({
      account: updatedAccount,
    });
  },
  setPendingTxs: (txs) => {
    set({
      pendingTxs: txs,
    });
  },
  removeTxById: (id) => {
    set((prev) => ({
      pendingTxs: prev.pendingTxs.filter((value) => value.transactionId !== id),
    }));
  },
}));
