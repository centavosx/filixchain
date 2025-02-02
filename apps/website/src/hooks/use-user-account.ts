import { Account } from '@ph-blockchain/block';
import { create } from 'zustand';

export type SerializedAccount = ReturnType<Account['serialize']>;

export type UseUserAccount = {
  account?: SerializedAccount;
  setAccount: (value: SerializedAccount) => void;
};

export const useUserAccountStore = create<UseUserAccount>((set) => ({
  account: undefined,
  setAccount: (updatedAccount) => {
    set({
      account: updatedAccount,
    });
  },
}));
