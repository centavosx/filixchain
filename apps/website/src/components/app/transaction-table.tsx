import { HelpCircle, Eye } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import { Button } from '../ui/button';
import { Typography } from '../ui/typography';
import { MintOrTxSerialize, Transaction } from '@ph-blockchain/block';

const txs = [
  {
    block: '23232',
    hash: '0006cd4982f67f3f988bc01638873cf3d1b96615febbe6f2f7fd8569f0c9a632',
    from: '3d1b96615febbe6f2f7fd8569f0c9a632adc2123',
    to: '3d1b96615febbe6f2f7fd8569f0c9a632adc2123',
    amount: '10',
  },
];

export type TransactionTableProps = {
  data: MintOrTxSerialize[];
};
export const TransactionTable = ({ data }: TransactionTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Block</TableHead>
          <TableHead className="min-w-[90px]">Hash</TableHead>
          <TableHead className="min-w-[90px]">From</TableHead>
          <TableHead className="min-w-[90px]">To</TableHead>
          <TableHead className="text-center">Amount</TableHead>
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
        {data.map((tx) => (
          <TableRow key={tx.transactionId}>
            <TableCell className="font-medium">{tx.blockHeight}</TableCell>
            <TableCell className="text-wrap break-all max-w-[230px]">
              {tx.transactionId}
            </TableCell>
            <TableCell className="text-wrap break-all max-w-[150px]">
              {tx.from}
            </TableCell>
            <TableCell className="text-wrap break-all max-w-[150px]">
              {tx.to}
            </TableCell>
            <TableCell className="text-center">
              {(BigInt(tx.amount) / Transaction.TX_CONVERSION_UNIT).toString()}{' '}
              PESO
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <Eye />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      {/* <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$2,500.00</TableCell>
        </TableRow>
      </TableFooter> */}
    </Table>
  );
};
