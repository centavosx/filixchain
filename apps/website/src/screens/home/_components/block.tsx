'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useGetBlocksQuery } from '@/hooks/api/use-get-blocks';
import { UiMapper } from '@/lib/ui-mapper';
import { Events } from '@ph-blockchain/api';
import { Block } from '@ph-blockchain/block';
import { useEffect, useState } from 'react';

export const BlockSection = () => {
  const { data } = useGetBlocksQuery({
    limit: 3,
    reverse: true,
  });

  const [blocks, setBlocks] = useState(data?.data ?? []);

  useEffect(() => {
    const off = Events.createConfirmedBlockListener((data) => {
      const block = new Block(
        data.version,
        data.height,
        data.transactions || [],
        data.targetHash,
        data.previousHash,
        data.nonce,
        data.timestamp,
      );

      setBlocks((prev) => {
        const newBlock = [UiMapper.block(block.toJson(false)), ...prev];

        if (newBlock.length > 3) {
          newBlock.pop();
        }

        return newBlock;
      });
    });

    return off;
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Typography as="h4">Latest Blocks</Typography>

      {blocks.map((value) => (
        <Card className="shadow-xl" key={value.blockHash}>
          <CardHeader className="gap-2">
            <CardTitle>Block #{value.height}</CardTitle>
            <CardDescription className="flex flex-col gap-2">
              <Typography className="text-wrap break-all" as="muted">
                Hash:
                {value.blockHash}
              </Typography>
              {!!value.displayCreated && (
                <Typography as="muted">
                  Created: {value.displayCreated}
                </Typography>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Typography className="text-wrap break-all" as="muted">
              Previous: {value.previousHash}
            </Typography>
            <Typography className="text-wrap break-all" as="muted">
              Merkle: {value.merkleRoot}
            </Typography>
            <Typography className="text-wrap break-all" as="muted">
              Target: {value.targetHash}
            </Typography>
            <Typography as="large">
              Transactions: {value.transactionSize}
            </Typography>
            <Button
              className="w-full"
              href={value.viewLink}
              linkProps={{
                className: 'max-w-32 mt-4',
              }}
            >
              View
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
