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
  register: (data: string, password: string) => Promise<void>;
  login: (password: string) => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<
  UseAuthStore,
  [['zustand/persist', Partial<UseAuthStore>]]
>(
  persist(
    (set, get) => ({
      storedAccount: undefined,
      register: async (data, password) => {
        const encryptedData = await encryptWithPassword(data, password);
        const account = new Account(data);
        await account.init();
        set({
          account,
          storedAccount: {
            data: encryptedData,
          },
        });
      },
      login: async (password) => {
        const storedAccount = get().storedAccount;
        if (!storedAccount) throw new Error('No account added');
        const data = await decryptWithPassword(storedAccount.data, password);
        const account = new Account(data);
        await account.init();
        set({
          account,
        });
      },
      logout: () => {
        set({
          account: undefined,
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
