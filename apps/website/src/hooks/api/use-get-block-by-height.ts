import { getQueryClient } from '@/lib/query-client';
import { UiMapper } from '@/lib/ui-mapper';
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
  const mappedTransactions: ReturnType<typeof UiMapper.transactions> = [];
  let minerTransaction: Minter | undefined;

  for (const encodedTransaction of data.transactions ?? []) {
    const isForMiner = encodedTransaction.length === Minter.ENCODED_SIZE;
    const decodedMintOrTx = isForMiner
      ? Minter.decode(encodedTransaction)
      : Transaction.decode(encodedTransaction);

    if (isForMiner) {
      minerTransaction = decodedMintOrTx as Minter;
    }

    const serializedData = decodedMintOrTx.serialize();
    mappedTransactions.push(UiMapper.transaction(serializedData));
  }

  return {
    ...data,
    transactions: mappedTransactions,
    displayCreated: Transform.date.formatToReadable(Number(data.timestamp)),
    minerTransaction,
  };
};

export const useGetBlockByHeightQuery = (height: string) => {
  return useQuery({
    queryKey: ['blocks', 'height', height],
    queryFn: () => Block.getBlockByHeight(height),
    select: getBlockByHeightQueryAdapter,
  });
};
