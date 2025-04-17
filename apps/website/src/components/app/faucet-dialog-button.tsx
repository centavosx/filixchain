'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Defaults } from '@/constants/defaults';
import { usePostFaucet } from '@/hooks/api/use-post-faucet';
import { zodResolver } from '@hookform/resolvers/zod';
import { Transaction } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { appToast } from './custom-toast';
import { PiggyBank } from 'lucide-react';
import { Label } from '../ui/label';
import { SidebarMenuButton } from '../ui/sidebar';

const FaucetSchema = z.object({
  to: z.string().regex(/^ph-[0-9a-fA-F]{40}/, 'Not a valid address'),
});

export const FaucetDialogButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutateAsync, isPending } = usePostFaucet();

  const form = useForm<z.infer<typeof FaucetSchema>>({
    values: {
      to: '',
    },
    resolver: zodResolver(FaucetSchema),
  });

  const handleSubmit = async (data: z.infer<typeof FaucetSchema>) => {
    await mutateAsync(Transform.removePrefix(data.to, Transaction.prefix), {
      onSuccess: ({ data }) => {
        setIsDialogOpen(false);
        appToast({
          type: 'success',
          title: 'Faucet added to mempool',
          subtitle:
            'Successfully submitted this transaction to the mempool. Please wait for your faucet transaction to be confirmed.',
          messages: [
            `Hash: ${data[0].transactionId}`,
            `Amount: ${Transform.toHighestUnit(data[0].amount)}`,
            `Fee: ${Transform.toHighestUnit(data[0].fixedFee)}`,
          ],
        });
      },
      onError: (e) => {
        appToast(e);
      },
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Form {...form}>
        <SidebarMenuButton onClick={() => setIsDialogOpen(true)}>
          <PiggyBank />
          <Label>Faucet</Label>
        </SidebarMenuButton>
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <DialogHeader>
              <DialogTitle>Faucet</DialogTitle>
              <DialogDescription>
                A faucet is a blockchain tool that distributes tokens for free
                to anyone who requests them.
              </DialogDescription>
              <DialogDescription>
                You can request tokens from the faucet up to 3 times per day,
                totaling 10 {Defaults.nativeCoinName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="to"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To</FormLabel>
                      <FormControl>
                        <Input placeholder="Send to" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" isLoading={isPending}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
};
