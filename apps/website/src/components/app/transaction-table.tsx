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
            <TableCell className="text-wrap break-all max-w-[250px]">
              {tx.transactionId}
            </TableCell>
            <TableCell className="text-wrap break-all max-w-[200px]">
              {tx.from}
            </TableCell>
            <TableCell className="text-wrap break-all max-w-[200px]">
              {tx.to}
            </TableCell>
            <TableCell className="text-center">
              {(BigInt(tx.amount) / Transaction.TX_CONVERSION_UNIT).toString()}{' '}
              PESO
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" asChild>
                <a href={`/transaction/${tx.transactionId}`}>
                  <Eye />
                </a>
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
