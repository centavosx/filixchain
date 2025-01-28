'use client';

import { Moon, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Menubar, MenubarMenu, MenubarTrigger } from '../ui/menubar';
import { SidebarTrigger } from '../ui/sidebar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import * as bip39 from 'bip39';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '../ui/textarea';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/hooks/use-auth';

const FormSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: 'Password must be at least 8 characters.',
      })
      .regex(/[A-Z]/, 'Password must contain uppercase')
      .regex(/[a-z]/, 'Password must contain lowercase')
      .regex(/[0-9]/, 'Password must contain digits')
      .regex(/[^\w]/, 'Password must contain special characters'),
    confirmPassword: z.string(),
    privateKey: z.string().min(1, 'Required'),
  })
  .superRefine(({ confirmPassword, password, privateKey }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }

    const isMnemonic = bip39.validateMnemonic(privateKey);

    if (!/^[0-9a-fA-F]{64}$/.test(privateKey) && !isMnemonic) {
      ctx.addIssue({
        code: 'custom',
        message: 'Not a valid private key or mnemonic',
        path: ['privateKey'],
      });
    }
  });

const AccountFormSheet = () => {
  const { account, register } = useAuthStore();
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  console.log(account);
  const form = useForm<z.infer<typeof FormSchema>>({
    values: {
      password: '',
      confirmPassword: '',
      privateKey: '',
    },
    resolver: zodResolver(FormSchema),
  });

  const handleGenerateMnemonic = () => {
    form.setValue('privateKey', bip39.generateMnemonic());
    setHasGenerated(true);
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const { privateKey, password } = data;
    const isPriv = /^[0-9a-fA-F]{64}$/.test(privateKey);
    const isMnemonic = bip39.validateMnemonic(privateKey);

    if (!isPriv && !isMnemonic)
      throw new Error('Not a valid private key or mnemonic');

    register(privateKey, password);

    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) return;
    form.reset();
    setHasGenerated(false);
  }, [isOpen, form]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <User />
        </Button>
      </SheetTrigger>
      <Form {...form}>
        <SheetContent className="flex flex-col gap-8">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <SheetHeader>
              <SheetTitle>Account</SheetTitle>
              <SheetDescription>
                You need to add your account to continue.
              </SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Confirm Password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="privateKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Private Key / Mnemonic</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Private Key / Mnemonic"
                        {...field}
                        rows={10}
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Your private key / mnemonic will be encrypted by your
                      password.
                    </FormDescription>
                    <FormDescription>
                      NOTE: Private key should be in hexadecimals
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter>
              <Button
                variant="outline"
                onClick={handleGenerateMnemonic}
                disabled={hasGenerated}
              >
                Generate Mnemonic
              </Button>
              <Button type="submit">Save changes</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Form>
    </Sheet>
  );
};

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
          <AccountFormSheet />
        </div>
      </MenubarMenu>
    </Menubar>
  );
};
