'use client';

import { Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menubar, MenubarMenu, MenubarTrigger } from '../ui/menubar';
import { SidebarTrigger } from '../ui/sidebar';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

export const Header = () => {
  const { setTheme } = useTheme();
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
          />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <User />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Account</SheetTitle>
                <SheetDescription>
                  You need to add your account to continue
                </SheetDescription>
              </SheetHeader>
              {/* <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value="Pedro Duarte"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value="@peduarte"
                    className="col-span-3"
                  />
                </div>
              </div> */}
              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit">Save changes</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </MenubarMenu>
    </Menubar>
  );
};
