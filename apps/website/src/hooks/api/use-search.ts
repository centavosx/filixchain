import { AppApi } from '@ph-blockchain/api';
import { ApiError } from '@ph-blockchain/api/src/error';
import { useQuery } from '@tanstack/react-query';

type Result = {
  type: 'height' | 'mempool' | 'transaction' | 'account';
  value: string;
};

export const useSearchQuery = (search: string) => {
  return useQuery<Result, ApiError>({
    queryKey: ['search', search],
    queryFn: () => AppApi.search(search),
    enabled: !!search,
    retry: 0,
  });
};
