'use client';

import { User } from 'lucide-react';
import { Sheet, SheetTrigger } from '../../ui/sheet';

import { useAuthStore } from '@/hooks/use-auth';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { RegisterSheetContent } from './register';
import { LoginSheetContent } from './login';
import { Accounts } from './accounts';

export const AuthSheet = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { storedAccount, account } = useAuthStore();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <User />
        </Button>
      </SheetTrigger>

      {!account ? (
        !!storedAccount ? (
          <LoginSheetContent />
        ) : (
          <RegisterSheetContent isOpen={isOpen} onChangeOpenState={setIsOpen} />
        )
      ) : (
        <Accounts />
      )}
    </Sheet>
  );
};
