import { Account } from '@/lib/wallet/account';
import { decryptWithPassword, encryptWithPassword } from './../lib/encrypt';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Derivation = {
  name: string;
};
export type UseAuthStore = {
  account?: Account;
  storedAccount?: {
    data: string;
  };
  register: (data: string, password: string) => void;
  login: (password: string) => void;
};

export const useAuthStore = create<
  UseAuthStore,
  [['zustand/persist', Partial<UseAuthStore>]]
>(
  persist(
    (set, get) => ({
      storedAccount: undefined,
      register: (data, password) => {
        set({
          account: new Account(data),
          storedAccount: {
            data: encryptWithPassword(data, password),
          },
        });
      },
      login: (password) => {
        const storedAccount = get().storedAccount;
        if (!storedAccount) throw new Error('No account added');
        const data = decryptWithPassword(storedAccount.data, password);
        set({
          account: new Account(data),
        });
      },
    }),
    {
      name: 'auth',
      partialize: (state) => ({
        storedAccount: state.storedAccount,
      }),
    },
  ),
);
