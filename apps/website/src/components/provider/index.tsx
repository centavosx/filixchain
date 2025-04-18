'use client';

import { PropsWithChildren } from 'react';
import { QueryClientProvider } from './query-client.provider';
import ThemeProvider from './theme.provider';
import { BaseApi, Events } from '@ph-blockchain/api';
import { SidebarProvider } from '../ui/sidebar';
import { Toaster } from '../ui/sonner';
import { Config } from '@/constants/config';
import { TooltipProvider } from '../ui/tooltip';

BaseApi.init(Config.apiBaseUrl);
Events.connect(Config.wsUrl);
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
        <TooltipProvider delayDuration={0}>
          <SidebarProvider>{children}</SidebarProvider>
        </TooltipProvider>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};
