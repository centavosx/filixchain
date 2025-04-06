'use client';

import { ReactNode } from 'react';

import { QueryClientProvider as ReactQueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';

export type QueryClientProviderProps = {
  children: ReactNode;
};
export const QueryClientProvider = ({ children }: QueryClientProviderProps) => {
  const queryClient = getQueryClient();

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
};
