import { getQueryClient } from '@/lib/query-client';
import { Account } from '@ph-blockchain/api';
import { AccountTransactionSearchDto } from '@ph-blockchain/api/src/types/account';
import { MintOrTxSerialize } from '@ph-blockchain/block';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { PaginationData } from '@ph-blockchain/api/src/types/pagination';
import { UiMapper } from '@/lib/ui-mapper';

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
      data.query.page,
      data.query.limit,
      data.query.start,
      data.query.end,
      data.query.reverse,
      data.query.from,
      data.query.to,
    ],
    queryFn: () => Account.getAccountTransaction(data.id, data.query),
  });
  return queryClient;
};

export const getAccountTransactionsAdapter = ({
  data,
  ...rest
}: PaginationData<MintOrTxSerialize>) => {
  return {
    ...rest,
    data: UiMapper.transactions(data),
  };
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
      query.page,
      query.limit,
      query.start,
      query.end,
      query.reverse,
      query.from,
      query.to,
    ],
    queryFn: () => Account.getAccountTransaction(id, query),
    select: getAccountTransactionsAdapter,
  });
};
