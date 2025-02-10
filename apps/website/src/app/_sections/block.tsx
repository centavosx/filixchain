'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Typography } from '@/components/ui/typography';
import { useNewBlock } from '@/hooks/use-new-block';
import { RawBlock } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';
import { useEffect, useState } from 'react';

export type BlockSectionProps = {
  blocks: RawBlock[];
};
export const BlockSection = ({ blocks: blocksProp }: BlockSectionProps) => {
  const [blocks, setBlocks] = useState(blocksProp);
  const { block } = useNewBlock();

  useEffect(() => {
    if (!block) return;

    setBlocks((prev) => {
      const newBlock = [block, ...prev];

      if (newBlock.length > 3) {
        newBlock.pop();
      }

      return newBlock;
    });
  }, [block]);

  return (
    <div className="flex flex-col gap-4">
      <Label asChild>
        <Typography as="h4">Latest Blocks</Typography>
      </Label>
      {blocks.map((value) => (
        <Card className="shadow-xl" key={value.blockHash}>
          <CardHeader className="gap-2">
            <CardTitle>Block #{value.height}</CardTitle>
            <CardDescription className="flex flex-col gap-2">
              <Typography className="text-wrap break-all" as="muted">
                Hash:
                {value.blockHash}
              </Typography>
              {!!value.timestamp && (
                <Typography as="small">
                  Created: {Transform.date.formatToReadable(value.timestamp)}
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
            <Button className="max-w-32 mt-4" href={`/block/${value.height}`}>
              View
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
