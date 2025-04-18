import { Defaults } from '@/constants/defaults';
import { Mempool } from '@ph-blockchain/api';
import { SerializedTransaction } from '@ph-blockchain/api/src/types/transaction';
import { Transform } from '@ph-blockchain/transformer';
import { useQuery } from '@tanstack/react-query';

const adapter = ({ data }: { data: SerializedTransaction[] }) => {
  return data.map((value) => ({
    ...value,
    displayAmount: `${Transform.toHighestUnit(
      value.amount,
    ).toString()} ${Defaults.nativeCoinName}`,
    displayFee: `${Transform.toHighestUnit(Number(value.fixedFee) + Number(value.additionalFee))} ${Defaults.nativeCoinName}`,
  }));
};

export const useGetPendingTransactionsByWalletAddressQuery = (
  rawWalletAddress: string,
  disabled?: boolean,
) => {
  return useQuery({
    queryKey: ['mempool', 'walletAddress', rawWalletAddress],
    queryFn: () => Mempool.getMempoolByAddress(rawWalletAddress),
    enabled: !disabled,
    select: adapter,
  });
};
