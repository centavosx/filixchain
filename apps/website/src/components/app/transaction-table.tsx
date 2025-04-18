import { HelpCircle, Eye } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Typography } from '../ui/typography';
import {
  TablePagination,
  TablePaginationProps,
} from './table-pagination/table-pagination';
import { UiMapper } from '@/lib/ui-mapper';

export type TransactionTableProps = {
  data: ReturnType<(typeof UiMapper)['transactions']>;
  shouldExcludeBlock?: boolean;
  pagination?: TablePaginationProps;
};
export const TransactionTable = ({
  data,
  shouldExcludeBlock,
  pagination,
}: TransactionTableProps) => {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {!shouldExcludeBlock && <TableHead>Block</TableHead>}
            <TableHead className="min-w-[180px]">Hash</TableHead>
            <TableHead className="min-w-[180px]">From</TableHead>
            <TableHead className="min-w-[180px]">To</TableHead>
            <TableHead className="text-center">Amount</TableHead>
            <TableHead>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <HelpCircle />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <Typography>View Transaction</Typography>
                </TooltipContent>
              </Tooltip>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((tx, index) => (
            <TableRow key={`${tx.transactionId}_${index}`}>
              {!shouldExcludeBlock && (
                <TableCell className="font-medium">{tx.blockHeight}</TableCell>
              )}
              <TableCell className="text-wrap break-all max-w-[250px]">
                {tx.transactionId}
              </TableCell>
              <TableCell className="text-wrap break-all max-w-[200px]">
                {tx.from}
              </TableCell>
              <TableCell className="text-wrap break-all max-w-[200px]">
                {tx.to}
              </TableCell>
              <TableCell className="text-center">{tx.displayAmount}</TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" href={tx.viewLink}>
                  <Eye />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {!!pagination && <TablePagination {...pagination} />}
    </div>
  );
};
