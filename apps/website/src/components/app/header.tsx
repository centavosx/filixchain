'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menubar, MenubarMenu, MenubarTrigger } from '../ui/menubar';
import { SidebarTrigger } from '../ui/sidebar';
import { AuthSheet } from './auth-sheet';
import { useRouter } from 'next/navigation';
import { Transform } from '@ph-blockchain/transformer';
import { Transaction } from '@ph-blockchain/block';
import { AppHash } from '@ph-blockchain/hash';

export const Header = () => {
  const { setTheme } = useTheme();
  const { push } = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.key !== 'Enter') return;
    const value = (e.target as HTMLInputElement).value;
    const normalizedValue = Transform.removePrefix(
      value.trim(),
      Transaction.prefix,
    ).trim();

    if (AppHash.HASH_REGEX.test(normalizedValue)) {
      if (normalizedValue.length === 40) {
        push(`/account/${normalizedValue}`);
        return;
      }
      if (normalizedValue.length === 64) {
        push(`/transaction/${normalizedValue}`);
        return;
      }
    }

    if (/^\d+$/.test(normalizedValue)) {
      push(`/block/${normalizedValue}`);
      return;
    }
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
          <Input
            className="max-w-[450px] flex flex-1"
            placeholder="Search Address..."
            onKeyDown={handleKeyDown}
          />
          <AuthSheet />
        </div>
      </MenubarMenu>
    </Menubar>
  );
};
