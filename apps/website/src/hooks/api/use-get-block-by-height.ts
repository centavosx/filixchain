import { getQueryClient } from '@/lib/query-client';
import { Block } from '@ph-blockchain/api';
import { Minter, RawBlock, Transaction } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';
import { QueryClient, useQuery } from '@tanstack/react-query';

export const prefetchGetBlockByHeightQuery = async ({
  queryClient = getQueryClient(),
  data,
}: {
  queryClient?: QueryClient;
  data: {
    height: string;
  };
}) => {
  await queryClient.prefetchQuery({
    queryKey: ['blocks', 'height', data.height],
    queryFn: () => Block.getBlockByHeight(data.height),
  });
  return queryClient;
};

export const getBlockByHeightQueryAdapter = (data: RawBlock) => {
  return {
    ...data,
    transactions:
      data.transactions?.map((encoded) => {
        const mintOrTx =
          encoded.length === Minter.ENCODED_SIZE
            ? Minter.decode(encoded)
            : Transaction.decode(encoded);
        const value = mintOrTx.serialize();
        return {
          ...value,
          displayAmount: `${(
            BigInt(value.amount) / Transaction.TX_CONVERSION_UNIT
          ).toString()} PESO`,
          viewLink: `/transaction/${value.transactionId}`,
        };
      }) ?? [],
    displayCreated: Transform.date.formatToReadable(Number(data.timestamp)),
  };
};

export const useGetBlockByHeightQuery = (height: string) => {
  return useQuery({
    queryKey: ['blocks', 'height', height],
    queryFn: () => Block.getBlockByHeight(height),
    select: getBlockByHeightQueryAdapter,
  });
};
