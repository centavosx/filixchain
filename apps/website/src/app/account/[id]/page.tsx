import { Defaults } from '@/constants/defaults';
import { prefetchGetAccountByIdQuery } from '@/hooks/api/use-get-account-by-id';
import { prefetchGetAccountTransactionsQuery } from '@/hooks/api/use-get-account-transactions';
import { searchParamParser } from '@/lib/search-param-parser';
import AccountDetailsScreen from '@/screens/accounts/details';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

export type AccountProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page: string; reverse: string; limit: string }>;
};
export default async function AccountPage({
  params,
  searchParams,
}: AccountProps) {
  const accountId = (await params).id;
  const awaitedSearchParams = await searchParams;

  const page = searchParamParser({
    key: 'page',
    searchParams: awaitedSearchParams,
    transformer: Number,
    validator: (value) => isFinite(value) && value > 0,
    fallback: 1,
  });

  const reverse = searchParamParser({
    key: 'reverse',
    searchParams: awaitedSearchParams,
    transformer: (value) => (!value ? true : value.toLowerCase() === 'true'),
    fallback: true,
  });

  const limit = searchParamParser({
    key: 'limit',
    searchParams: awaitedSearchParams,
    transformer: (value) => {
      if (!value) return Defaults.defaultLimit;
      return Number(value);
    },
    validator: (value) =>
      isFinite(value) && value > 0 && value <= Defaults.maxLimit,
    fallback: Defaults.maxLimit,
  });

  const queryClient = await prefetchGetAccountByIdQuery({
    data: {
      id: accountId,
    },
  });

  const queryData: { data: { size: number } } | undefined =
    queryClient.getQueryData(['account', 'address', accountId]);

  if (!queryData) notFound();

  const query = {
    page,
    reverse,
    limit,
  };

  await prefetchGetAccountTransactionsQuery({
    queryClient,
    data: {
      id: accountId,
      query,
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AccountDetailsScreen
        page={page}
        limit={query.limit}
        reverse={query.reverse}
      />
    </HydrationBoundary>
  );
}
