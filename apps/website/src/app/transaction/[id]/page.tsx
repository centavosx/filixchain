import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';

export type TransactionReceiptProps = {
  params: Promise<{ id: string }>;
};
export default async function TransactionReceipt({}: TransactionReceiptProps) {
  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardHeader>
            <CardTitle>
              <Typography>Transaction Receipt</Typography>
            </CardTitle>
            <CardDescription>
              <Typography>Hash: dawdwadawdawdawd</Typography>
              <Typography>Created: dawdwadawdawdawd</Typography>
            </CardDescription>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent className="flex flex-row gap-8">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Typography as="muted">Block Height:</Typography>
                <Typography as="large">#2313</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">From:</Typography>
                <Typography as="large">#2313</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">To:</Typography>
                <Typography as="large">#2313</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">Nonce:</Typography>
                <Typography as="large">#2313</Typography>
              </div>
            </div>
            <Separator orientation="vertical" />
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Typography as="muted">Amount:</Typography>
                <Typography as="h3">#23132313123</Typography>
              </div>
              <div className="flex flex-col gap-2">
                <Typography as="muted">Fee:</Typography>
                <Typography as="large">#2313</Typography>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
