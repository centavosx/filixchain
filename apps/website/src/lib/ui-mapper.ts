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
      displayAmount: `${(
        BigInt(value.amount) / Transaction.TX_CONVERSION_UNIT
      ).toString()} PESO`,
      viewLink: `/transaction/${value.transactionId}`,
    };
  }

  static transactions(value: MintOrTxSerialize[]) {
    return value.map(UiMapper.transaction);
  }
}
