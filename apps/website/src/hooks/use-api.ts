import { useCallback, useEffect, useRef, useState } from 'react';
import { AxiosError } from 'axios';
import { BaseApi } from '@ph-blockchain/api';
import { getTokens } from '@/lib/server/get-tokens';

BaseApi.init('http://localhost:3002/api').setGetToken(getTokens);

// TODO: Use react-query
// NOTE: Make sure callback is memoized
export const useApi = <P extends Array<unknown>, R>(
  callback: (...param: P) => R,
) => {
  const callbackRef = useRef(callback);

  const isLoadingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Awaited<R>>();
  const [error, setError] =
    useState<AxiosError<{ message: string }, { message: string }>>();

  isLoadingRef.current = isLoading;

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const executeApi = useCallback(async (...params: P) => {
    if (isLoadingRef.current) return;
    setData(undefined);
    setIsLoading(true);
    try {
      const data = await callbackRef.current(...params);
      setData(data);
    } catch (e) {
      setError(e as AxiosError<{ message: string }, { message: string }>);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, executeApi };
};
