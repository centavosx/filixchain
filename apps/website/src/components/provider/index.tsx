'use client';

import { PropsWithChildren } from 'react';
import { QueryClientProvider } from './query-client.provider';
import ThemeProvider from './theme.provider';
import { BaseApi, Events } from '@ph-blockchain/api';
import { SidebarProvider } from '../ui/sidebar';
import { Toaster } from '../ui/sonner';

BaseApi.init('http://localhost:3002/api');
Events.connect('ws://localhost:3002');
Events.createConnectionListener(() => console.log('CONNECTED'));
Events.createErrorListener((e) => console.log(e));

export const Providers = ({
  nonce,
  children,
}: PropsWithChildren<{ nonce?: string | null }>) => {
  return (
    <QueryClientProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        nonce={nonce ?? ''}
      >
        <SidebarProvider>{children}</SidebarProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};
