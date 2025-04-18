'use client';

import {
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '../../ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as bip39 from 'bip39';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/hooks/use-auth';
import { ProtectedTextarea } from '../protected-text-area';
import { Checkbox } from '@/components/ui/checkbox';

const RegisterFormSchema = z
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
    showMnemonic: z.boolean().default(false),
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

export const RegisterSheetContent = () => {
  const { register } = useAuthStore();
  const form = useForm<z.infer<typeof RegisterFormSchema>>({
    values: {
      password: '',
      confirmPassword: '',
      privateKey: '',
      showMnemonic: false,
    },
    resolver: zodResolver(RegisterFormSchema),
  });

  const shouldShowMnemonic = form.watch('showMnemonic');

  const isSubmitting = form.formState.isSubmitting;

  const handleRegister = async (data: z.infer<typeof RegisterFormSchema>) => {
    const { privateKey, password } = data;
    const isPriv = /^[0-9a-fA-F]{64}$/.test(privateKey);
    const isMnemonic = bip39.validateMnemonic(privateKey);

    if (!isPriv && !isMnemonic)
      throw new Error('Not a valid private key or mnemonic');

    await register(privateKey, password);
  };

  const handleGenerateMnemonic = () => {
    form.setValue('privateKey', bip39.generateMnemonic());
  };

  return (
    <SheetContent className="flex flex-col gap-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleRegister)}
          className="space-y-8"
        >
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
                    <Input
                      placeholder="Password"
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
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
                    <Input
                      placeholder="Confirm Password"
                      autoComplete="new-password"
                      type="password"
                      {...field}
                    />
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
                    <ProtectedTextarea
                      placeholder="Private Key / Mnemonic"
                      masked={!shouldShowMnemonic}
                      {...field}
                      rows={10}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="flex space-x-2 py-2 items-center">
                    <Checkbox
                      id="show-mnemonic"
                      checked={shouldShowMnemonic}
                      onCheckedChange={(checked) => {
                        form.setValue('showMnemonic', Boolean(checked));
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="show-mnemonic"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Show
                      </label>
                    </div>
                  </div>
                  <FormDescription>
                    Your private key or mnemonic is stored locally and encrypted
                    with your password. Your account’s private keys are never
                    stored on the blockchain or server. All transactions are
                    signed locally using your private key and then validated on
                    the server.
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
              type="button"
              variant="outline"
              onClick={handleGenerateMnemonic}
            >
              Generate Mnemonic
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit
            </Button>
          </SheetFooter>
        </form>
      </Form>
    </SheetContent>
  );
};
