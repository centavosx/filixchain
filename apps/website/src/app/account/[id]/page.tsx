import { prefetchGetAccountByIdQuery } from '@/hooks/api/use-get-account-by-id';
import { prefetchGetAccountTransactionsQuery } from '@/hooks/api/use-get-account-transactions';
import { searchParamParser } from '@/lib/search-param-parser';
import AccountDetailsScreen from '@/screens/accounts/details';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { notFound } from 'next/navigation';

const MAX_LIMIT = 20;

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
    transformer: (value) =>
      value === undefined
        ? true
        : value === 'true' || value === 'True' || value === 'TRUE',
    fallback: true,
  });

  const limit = searchParamParser({
    key: 'limit',
    searchParams: awaitedSearchParams,
    transformer: Number,
    validator: (value) => isFinite(value) && value > 0 && value < 50,
    fallback: MAX_LIMIT,
  });

  const queryClient = await prefetchGetAccountByIdQuery({
    data: {
      id: accountId,
    },
  });

  const queryData: { data: { size: number } } | undefined =
    queryClient.getQueryData(['account', accountId]);

  if (!queryData) notFound();

  const txSize = +queryData.data.size;

  const numberOfPages = Math.ceil(txSize / limit);

  const query = {
    end: txSize - (page - 1) * limit,
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
        numberOfPages={numberOfPages}
        end={query.end}
        limit={query.limit}
        reverse={query.reverse}
      />
    </HydrationBoundary>
  );
}
