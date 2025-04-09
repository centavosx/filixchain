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
import {
  TablePagination,
  TablePaginationProps,
} from './table-pagination/table-pagination';
import { UiMapper } from '@/lib/ui-mapper';

export type BlocksTableProps = {
  data: ReturnType<(typeof UiMapper)['blocks']>;
  pagination?: TablePaginationProps;
};
export const BlocksTable = ({ data, pagination }: BlocksTableProps) => {
  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Height</TableHead>
            <TableHead className="min-w-[180px]">Hash</TableHead>
            <TableHead className="min-w-[180px]">Previous</TableHead>
            <TableHead className="min-w-[100px] text-center">Size</TableHead>
            <TableHead className="text-center">Created</TableHead>
            <TableHead>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <HelpCircle />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <Typography>View Block</Typography>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((block) => (
            <TableRow key={block.blockHash}>
              <TableCell className="text-wrap break-all max-w-[250px]">
                {block.height}
              </TableCell>
              <TableCell className="text-wrap break-all max-w-[250px]">
                {block.blockHash}
              </TableCell>
              <TableCell className="text-wrap break-all max-w-[200px]">
                {block.previousHash}
              </TableCell>
              <TableCell className="text-wrap break-all max-w-[200px] text-center">
                {block.transactionSize}
              </TableCell>
              <TableCell className="text-center">
                {block.displayCreated}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" href={block.viewLink}>
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
