'use client';

import { useSearchQuery } from '@/hooks/api/use-search';
import { Loader2, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menubar, MenubarMenu } from '../ui/menubar';
import { SidebarTrigger } from '../ui/sidebar';
import { AuthSheet } from './auth-sheet';
import { appToast } from './custom-toast';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export const Header = () => {
  const [search, setSearch] = useState('');
  const { data, error, isFetching } = useSearchQuery(search);
  const { setTheme } = useTheme();
  const { push } = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.key !== 'Enter') return;
    const value = (e.target as HTMLInputElement).value;
    setSearch(value);
  };

  useEffect(() => {
    if (!data) return;

    const value = data.value;

    switch (data.type) {
      case 'account':
        push(`/account/${value}`);
        break;
      case 'height':
        push(`/block/${value}`);
        break;
      case 'transaction':
        push(`/transaction/${value}`);
        break;
      case 'mempool':
        push(`/mempool/${value}`);
        break;
    }
  }, [data, push]);

  useEffect(() => {
    if (!error) return;
    appToast(error);
  }, [error]);

  return (
    <Menubar className="justify-between p-8 max-md:px-2 w-full bg-background rounded-none gap-4">
      <MenubarMenu>
        <SidebarTrigger />
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
              className={cn('flex-1', isFetching && 'pr-10')}
              placeholder="Search Address..."
              onKeyDown={handleKeyDown}
              disabled={isFetching}
            />
            {isFetching && (
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
