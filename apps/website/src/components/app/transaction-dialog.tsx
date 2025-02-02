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
import { useUserAccountStore } from '@/hooks/use-user-account';
import { zodResolver } from '@hookform/resolvers/zod';
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

const CreateTransactionSchema = z.object({
  to: z.string().regex(/^ph-[0-9a-fA-F]{40}/, 'Not a valid address'),
  amount: z.coerce.number().gt(0, 'Amount should be greater than zero'),
});

export const TransactionDialog = () => {
  const { account } = useUserAccountStore();
  const form = useForm<z.infer<typeof CreateTransactionSchema>>({
    values: {
      to: '',
      amount: 0,
    },
    resolver: zodResolver(CreateTransactionSchema),
  });

  const handleSubmit = async (
    data: z.infer<typeof CreateTransactionSchema>,
  ) => {};

  return (
    <Form {...form}>
      <Dialog>
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
                          placeholder="Amount In Peso"
                          type="number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
};
