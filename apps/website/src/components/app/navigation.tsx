'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menubar, MenubarMenu, MenubarTrigger } from '../ui/menubar';

export const Navigation = () => {
  const { setTheme } = useTheme();
  return (
    <Menubar className="justify-between p-8">
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
      </MenubarMenu>
      <MenubarMenu>
        <div className="flex gap-4">
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
          <Input className="max-w-[350px]" placeholder="Search Address..." />
        </div>
      </MenubarMenu>
    </Menubar>
  );
};
