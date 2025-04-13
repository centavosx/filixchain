'use client';

import {
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../../ui/sheet';
import { AlertCircle } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '../../ui/button';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';

const LoginFormSchema = z.object({
  password: z.string(),
});

export const LoginSheetContent = () => {
  const [isLoginError, setIsLoginError] = useState(false);
  const { login, reset } = useAuthStore();
  const form = useForm<z.infer<typeof LoginFormSchema>>({
    values: {
      password: '',
    },
    resolver: zodResolver(LoginFormSchema),
  });
  const isSubmitting = form.formState.isSubmitting;

  const handleLogin = async (data: z.infer<typeof LoginFormSchema>) => {
    const { password } = data;
    try {
      await login(password);
      setIsLoginError(false);
    } catch {
      setIsLoginError(true);
    }
  };

  return (
    <Form {...form}>
      <SheetContent className="flex flex-col gap-8">
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-8">
          <SheetHeader>
            <SheetTitle>Login</SheetTitle>
            <Alert>
              <AlertTitle>Required</AlertTitle>
              <AlertDescription>
                You need to login to access your account again.
              </AlertDescription>
            </Alert>
          </SheetHeader>
          <div className="flex flex-col gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {!!isLoginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Wrong password. Please try again.
              </AlertDescription>
            </Alert>
          )}
          <SheetFooter>
            <Button type="button" variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Login
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Form>
  );
};
