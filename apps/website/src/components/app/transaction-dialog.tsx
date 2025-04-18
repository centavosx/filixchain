import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/hooks/use-auth';
import { useUserAccountStore } from '@/hooks/use-user-account';
import { zodResolver } from '@hookform/resolvers/zod';
import { Block, Transaction } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';
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
import { usePostSubscribe } from '@/hooks/api/use-post-subscribe';
import { appToast } from './custom-toast';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Defaults } from '@/constants/defaults';
import { Textarea } from '../ui/textarea';

const CreateTransactionSchema = z.object({
  to: z.string().regex(/^ph-[0-9a-fA-F]{40}/, 'Not a valid address'),
  amount: z.coerce.number().gte(0, 'Not a valid number'),
  memo: z.string().optional(),
});

export const TransactionDialog = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutateAsync, isPending } = usePostSubscribe();
  const { account: authAccount } = useAuthStore();
  const { account, pendingTxs } = useUserAccountStore();
  const size = pendingTxs.length;

  const form = useForm<z.infer<typeof CreateTransactionSchema>>({
    values: {
      to: '',
      amount: 0,
    },
    resolver: zodResolver(CreateTransactionSchema),
  });

  const handleSubmit = async (
    data: z.infer<typeof CreateTransactionSchema>,
  ) => {
    if (!account) return;

    const signedAccount = authAccount?.getSignedAccount();
    if (!signedAccount) return;

    const transaction = new Transaction({
      from: Transform.addPrefix(account.address, Transaction.prefix),
      to: data.to,
      amount: Transform.toLowestUnit(data.amount ?? 0),
      nonce: Number(account.nonce) + size,
      version: Block.version,
      memo: data.memo,
    });

    const signedTransaction = transaction.sign(
      signedAccount.keyPairs.secretKey,
    );

    const encodedTransaction = signedTransaction.encode();

    await mutateAsync([encodedTransaction], {
      onSuccess: ({ data }) => {
        queryClient.invalidateQueries({
          queryKey: ['mempool', 'walletAddress'],
        });
        setIsDialogOpen(false);
        appToast({
          type: 'success',
          title: 'Added to mempool',
          subtitle:
            'You have successfully submitted this transaction to the mempool. Please wait for your transaction to be confirmed.',
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
        <DialogTrigger asChild>
          <Button variant="outline">Send</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <DialogHeader>
              <DialogTitle>Create Transaction</DialogTitle>
              <DialogDescription>Send amount</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={`Amount In ${Defaults.nativeCoinName}`}
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="memo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Memo</FormLabel>
                      <FormControl>
                        <Textarea placeholder={`Memo (Optional)`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" isLoading={isPending}>
                Send
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Form>
    </Dialog>
  );
};
