import { Defaults } from '@/constants/defaults';
import { Mempool } from '@ph-blockchain/api';
import { SerializedTransaction } from '@ph-blockchain/api/src/types/transaction';
import { Transaction } from '@ph-blockchain/block';
import { useQuery } from '@tanstack/react-query';

const adapter = ({ data }: { data: SerializedTransaction[] }) => {
  return data.map((value) => ({
    ...value,
    displayAmount: `${(
      BigInt(value.amount) / Transaction.TX_CONVERSION_UNIT
    ).toString()} ${Defaults.nativeCoinName}`,
    nonce: value.nonce,
    displayFee: `${(
      BigInt(value.fixedFee) / Transaction.TX_CONVERSION_UNIT
    ).toString()} ${Defaults.nativeCoinName}`,
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
