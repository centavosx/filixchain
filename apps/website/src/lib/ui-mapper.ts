import { MintOrTxSerialize, RawBlock, Transaction } from '@ph-blockchain/block';
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
      displayCreated: Transform.date.formatToReadable(Number(value.timestamp)),
      displayAmount: `${(
        BigInt(value.amount) / Transaction.TX_CONVERSION_UNIT
      ).toString()} PESO`,
      viewLink: `/transaction/${value.transactionId}`,
      mintData:
        'fixedFee' in value
          ? {
              displayFixedFee: `${Transform.toHighestUnit(value.fixedFee)} PESO`,
            }
          : undefined,
    };
  }

  static transactions(value: MintOrTxSerialize[]) {
    return value.map(UiMapper.transaction);
  }
}
