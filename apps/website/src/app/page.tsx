import { Navigation } from '@/components/app/navigation';
import { HelpCircle, Eye } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Typography } from '@/components/ui/typography';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

const invoices = [
  {
    block: '23232',
    hash: '0006cd4982f67f3f988bc01638873cf3d1b96615febbe6f2f7fd8569f0c9a632',
    from: '3d1b96615febbe6f2f7fd8569f0c9a632adc2123',
    to: '3d1b96615febbe6f2f7fd8569f0c9a632adc2123',
    totalAmount: '$250.00',
    paymentMethod: 'Credit Card',
  },
];

export default function Home() {
  return (
    <div className="flex flex-col p-6 gap-8">
      <section>
        <Card>
          <CardContent className="flex flex-col md:flex-row gap-8 justify-between md:items-center p-6">
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <Typography as="h3">Supply</Typography>
              <Separator />
              <Typography as="lead">12</Typography>
            </div>
            {/* <Separator className="h-20" orientation="vertical" /> */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <Typography as="h3">Blocks</Typography>
              <Separator />
              <Typography as="lead">12232</Typography>
            </div>
            {/* <Separator className="h-20" orientation="vertical" /> */}
            <div className="flex-1 flex flex-col gap-4 justify-center">
              <Typography as="h3">Transactions</Typography>
              <Separator />
              <Typography as="lead">12232</Typography>
            </div>
          </CardContent>
        </Card>
      </section>
      <section className="flex flex-1 gap-8 flex-col xl:flex-row">
        <div className="flex flex-col gap-4">
          <Label asChild>
            <Typography as="h4">Latest Blocks</Typography>
          </Label>
          {Array.from({ length: 3 }, (_, i) => (
            <Card className="shadow-xl" key={i}>
              <CardHeader className="gap-2">
                <CardTitle>Block #121312</CardTitle>
                <CardDescription className="flex flex-col gap-2">
                  <Typography as="muted">
                    Hash:
                    0006cd4982f67f3f988bc01638873cf3d1b96615febbe6f2f7fd8569f0c9a632
                  </Typography>
                  <Typography as="small">
                    Created: January 25, 2025 10:00 PM
                  </Typography>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                <Typography as="muted">
                  Previous:
                  00032de579c84d6e7a4763170dfc635823ab58ac055acc96e8da8165b6a5bc4b
                </Typography>
                <Typography as="muted">
                  Merkle:
                  ce7911f8ccb7a31ec395db1e19785399cdf5acff0c9fa29c4e253e19998e3d5e
                </Typography>
                <Typography as="muted">
                  Target:
                  fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
                </Typography>
                <Typography as="large">Transactions: 1999999</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Label asChild>
            <Typography as="h4">Latest Transactions</Typography>
          </Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <HelpCircle />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <Typography>Added</Typography>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.hash}>
                  <TableCell className="font-medium">{invoice.block}</TableCell>
                  <TableCell>{invoice.hash}</TableCell>
                  <TableCell>{invoice.from}</TableCell>
                  <TableCell>{invoice.to}</TableCell>
                  <TableCell>{invoice.totalAmount}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Eye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell className="text-right">$2,500.00</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </section>
    </div>
  );
}
