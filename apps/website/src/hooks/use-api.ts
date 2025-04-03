import { BaseApi } from '@ph-blockchain/api';
import { useCallback, useRef, useState } from 'react';
import { AxiosError } from 'axios';
BaseApi.init('http://localhost:3002/api');

// NOTE: Make sure callback is memoized
export const useApi = <P extends Array<unknown>, R>(
  callback: (...param: P) => R,
) => {
  const isLoadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Awaited<R>>();
  const [error, setError] =
    useState<AxiosError<{ message: string }, { message: string }>>();

  isLoadingRef.current = isLoading;

  const executeApi = useCallback(
    async (...params: P) => {
      if (isLoadingRef.current) return;
      setData(undefined);
      setIsLoading(true);
      try {
        const data = await callback(...params);
        setData(data);
      } catch (e) {
        setError(e as AxiosError<{ message: string }, { message: string }>);
      } finally {
        setIsLoading(false);
      }
    },
    [callback],
  );

  return { data, isLoading, error, executeApi };
};
