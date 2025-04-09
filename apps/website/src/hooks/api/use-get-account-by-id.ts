import { getQueryClient } from '@/lib/query-client';
import { Account } from '@ph-blockchain/api';
import { GetAccountResult } from '@ph-blockchain/api/src/types/account';
import { Transaction } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetAccountByIdQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: {
    id: string;
  };
}) => {
  await queryClient.prefetchQuery({
    queryKey: ['account', data.id],
    queryFn: () => Account.getAccount(data.id),
  });
  return queryClient;
};

export const getAccountByIdAdapter = (data: GetAccountResult) => {
  return {
    ...data,
    displayAddress: Transform.addPrefix(data.address, Transaction.prefix),
    displayBalance: `${Transform.toHighestUnit(data.amount)} PESO`,
    size: +data.size,
  };
};

export const useGetAccountByIdQuery = (id: string, disabled?: boolean) => {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => Account.getAccount(id),
    select: getAccountByIdAdapter,
    enabled: !disabled,
  });
};
