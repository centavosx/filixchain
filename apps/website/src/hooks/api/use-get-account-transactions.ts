import { getQueryClient } from '@/lib/query-client';
import { Account } from '@ph-blockchain/api';
import { AccountTransactionSearchDto } from '@ph-blockchain/api/src/types/account';
import { MintOrTxSerialize } from '@ph-blockchain/block';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { getTransactionsAdapter } from './use-get-transactions';

export const prefetchGetAccountTransactionsQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: {
    id: string;
    query: AccountTransactionSearchDto;
  };
}) => {
  await queryClient.prefetchQuery({
    queryKey: [
      'account',
      data.id,
      'transactions',
      data.query.end,
      data.query.reverse,
      data.query.limit,
    ],
    queryFn: () => Account.getAccountTransaction(data.id, data.query),
  });
  return queryClient;
};

export const getAccountTransactionsAdapter = (response: {
  data: MintOrTxSerialize[];
}) => {
  const { data } = response;
  return getTransactionsAdapter({ data: { transactions: data } });
};

export const useGetAccountTransactionsQuery = (
  id: string,
  query: AccountTransactionSearchDto,
) => {
  return useQuery({
    queryKey: [
      'account',
      id,
      'transactions',
      query.end,
      query.reverse,
      query.limit,
    ],
    queryFn: () => Account.getAccountTransaction(id, query),
    select: getAccountTransactionsAdapter,
  });
};
