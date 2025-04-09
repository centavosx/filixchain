'use client';

import { User } from 'lucide-react';
import { Sheet, SheetTrigger } from '../../ui/sheet';

import { useAuthStore } from '@/hooks/use-auth';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '../../ui/button';
import { Accounts } from './accounts';
import { LoginSheetContent } from './login';
import { RegisterSheetContent } from './register';

export const AuthSheet = () => {
  const { storedAccount, account, logout } = useAuthStore();

  useEffect(() => {
    if (!account) return;

    const timeoutId = setTimeout(() => {
      logout();
      toast.error('Session ended. Re-login again to use your account.');
    }, 180000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [account, logout]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <User />
        </Button>
      </SheetTrigger>

      {!account ? (
        !!storedAccount ? (
          <LoginSheetContent />
        ) : (
          <RegisterSheetContent />
        )
      ) : (
        <Accounts />
      )}
    </Sheet>
  );
};
