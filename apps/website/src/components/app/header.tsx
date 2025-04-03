'use client';

import { Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menubar, MenubarMenu, MenubarTrigger } from '../ui/menubar';
import { SidebarTrigger } from '../ui/sidebar';
import { AuthSheet } from './auth-sheet';
import { Transform } from '@ph-blockchain/transformer';
import { Transaction } from '@ph-blockchain/block';
import { redirectToPage } from '@/lib/redirectToPage';
import { useApi } from '@/hooks/use-api';

export const Header = () => {
  const { executeApi, isLoading } = useApi(redirectToPage);
  const { setTheme } = useTheme();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.key !== 'Enter') return;
    const value = (e.target as HTMLInputElement).value;
    const normalizedValue = Transform.removePrefix(
      value.trim(),
      Transaction.prefix,
    ).trim();
    executeApi(normalizedValue);
  };

  return (
    <Menubar className="justify-between p-8 w-full bg-background rounded-none">
      <MenubarMenu>
        <SidebarTrigger />
        <MenubarTrigger>Block Explorer</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <div className="flex gap-4 flex-1 items-center justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setTheme((value) => (value === 'light' ? 'dark' : 'light'))
            }
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <div className="max-w-[450px] flex flex-1 relative">
            <Input
              className="flex-1"
              placeholder="Search Address..."
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            {isLoading && (
              <Loader2
                className="absolute animate-spin right-3 top-2"
                size={16}
              />
            )}
          </div>
          <AuthSheet />
        </div>
      </MenubarMenu>
    </Menubar>
  );
};
