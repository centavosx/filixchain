import { useMutation } from '@tanstack/react-query';

import { Mempool } from '@ph-blockchain/api';
import { ApiError } from '@ph-blockchain/api/src/error';

type MutationResponse = Awaited<ReturnType<(typeof Mempool)['subscribe']>>;
type MutationVariables = Parameters<(typeof Mempool)['subscribe']>[0];

export const usePostSubscribe = () => {
  return useMutation<MutationResponse, ApiError, MutationVariables>({
    mutationKey: ['subscribe'],
    mutationFn: (data) => Mempool.subscribe(data),
  });
};
