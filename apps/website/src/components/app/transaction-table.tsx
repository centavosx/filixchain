import { HelpCircle, Eye } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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

const txs = [
  {
    block: '23232',
    hash: '0006cd4982f67f3f988bc01638873cf3d1b96615febbe6f2f7fd8569f0c9a632',
    from: '3d1b96615febbe6f2f7fd8569f0c9a632adc2123',
    to: '3d1b96615febbe6f2f7fd8569f0c9a632adc2123',
    amount: '10',
  },
];

export const TransactionTable = () => {
  return (
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
        {txs.map((tx) => (
          <TableRow key={tx.hash}>
            <TableCell className="font-medium">{tx.block}</TableCell>
            <TableCell>{tx.hash}</TableCell>
            <TableCell>{tx.from}</TableCell>
            <TableCell>{tx.to}</TableCell>
            <TableCell>{tx.amount}</TableCell>
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
  );
};
