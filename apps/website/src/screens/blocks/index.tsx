'use client';

import { BlocksTable } from '@/components/app/blocks-table';
import { Typography } from '@/components/ui/typography';
import { useGetBlocksQuery } from '@/hooks/api/use-get-blocks';

type BlocksScreenProps = {
  page: number;
  limit: number;
  reverse: boolean;
};
export default function BlocksScreen({
  page,
  limit,
  reverse,
}: BlocksScreenProps) {
  const { data: blocks } = useGetBlocksQuery({
    page,
    limit,
    reverse,
  });
  return (
    <div className="flex flex-col p-6 gap-8">
      <div className="flex flex-col gap-2">
        <Typography as="h4">Blocks</Typography>
        <Typography as="muted">
          A block is a data structure used to record a group of transactions.
          Each block contains a unique identifier (hash), a reference to the
          hash of the previous block, a timestamp, and a list of confirmed
          transactions. These blocks are linked together through cryptographic
          hashes in chronological order, forming the blockchain.
        </Typography>
      </div>
      <BlocksTable
        data={blocks?.data ?? []}
        pagination={{
          currentPage: page,
          maxPage: blocks?.totalPages ?? 0,
        }}
      />
    </div>
  );
}
