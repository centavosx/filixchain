import { useMutation } from '@tanstack/react-query';

import { AppApi } from '@ph-blockchain/api';
import { ApiError } from '@ph-blockchain/api/src/error';

type MutationResponse = Awaited<ReturnType<(typeof AppApi)['faucet']>>;

export const usePostFaucet = () => {
  return useMutation<MutationResponse, ApiError, string>({
    mutationKey: ['faucet'],
    mutationFn: (data) => AppApi.faucet(data),
  });
};
