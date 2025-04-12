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
      <Typography as="h4">Blocks</Typography>
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
