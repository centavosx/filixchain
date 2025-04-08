'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import {
  getBlockHealthAdapter,
  useGetBlockHealthQuery,
} from '@/hooks/api/use-get-block-health';
import { Events } from '@ph-blockchain/api';
import { useEffect, useState } from 'react';

export const HealthSection = () => {
  const [health, setHealth] = useState<{
    supply: string;
    numberOfBlocks: string;
    txSize: string;
  }>();
  const { data } = useGetBlockHealthQuery();

  useEffect(() => {
    setHealth(data);
    const off = Events.createBlockHealthListener((value) =>
      setHealth(getBlockHealthAdapter({ data: value })),
    );

    return () => {
      off();
    };
  }, [data]);

  return (
    <section>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-8 justify-between md:items-center p-6">
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <Typography as="h3">Supply</Typography>
            <Separator />
            <Typography as="lead">{health?.supply}</Typography>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            <Typography as="h3">Blocks</Typography>
            <Separator />
            <Typography as="lead">{health?.numberOfBlocks}</Typography>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            <Typography as="h3">Transactions</Typography>
            <Separator />
            <Typography as="lead">{health?.txSize}</Typography>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
