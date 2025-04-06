'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Typography } from '@/components/ui/typography';
import { useGetBlockHealthQuery } from '@/hooks/api/use-get-block-health';

export const HealthSection = () => {
  const { data } = useGetBlockHealthQuery();

  return (
    <section>
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-8 justify-between md:items-center p-6">
          <div className="flex-1 flex flex-col gap-4 justify-center">
            <Typography as="h3">Supply</Typography>
            <Separator />
            <Typography as="lead">{data?.supply}</Typography>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            <Typography as="h3">Blocks</Typography>
            <Separator />
            <Typography as="lead">{data?.numberOfBlocks}</Typography>
          </div>

          <div className="flex-1 flex flex-col gap-4 justify-center">
            <Typography as="h3">Transactions</Typography>
            <Separator />
            <Typography as="lead">{data?.txSize}</Typography>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
