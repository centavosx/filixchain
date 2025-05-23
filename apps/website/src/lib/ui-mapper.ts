import { Defaults } from '@/constants/defaults';
import { MintOrTxSerialize, RawBlock } from '@ph-blockchain/block';
import { Transform } from '@ph-blockchain/transformer';

export class UiMapper {
  static block(value: RawBlock) {
    return {
      ...value,
      displayCreated: value.timestamp
        ? Transform.date.formatToReadable(value.timestamp)
        : undefined,
      viewLink: `/block/${value.height}`,
    };
  }

  static blocks(value: RawBlock[]) {
    return value.map(UiMapper.block);
  }

  static transaction(value: MintOrTxSerialize) {
    return {
      ...value,
      displayCreated: value.timestamp
        ? Transform.date.formatToReadable(Number(value.timestamp))
        : undefined,
      displayAmount: `${Transform.toHighestUnit(
        value.amount,
      ).toString()} ${Defaults.nativeCoinName}`,
      viewLink: `/transaction/${value.transactionId}`,
      mintData:
        'fixedFee' in value
          ? {
              displayFee: `${Transform.toHighestUnit(Number(value.fixedFee) + Number(value.additionalFee))} ${Defaults.nativeCoinName}`,
            }
          : undefined,
    };
  }

  static transactions(value: MintOrTxSerialize[]) {
    return value.map(UiMapper.transaction);
  }
}
