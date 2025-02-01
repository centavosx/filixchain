import { Transaction } from '@ph-blockchain/block';
import { DateTransformer } from './date';

export class Transform {
  static removePrefix(data: string, prefix: string) {
    return data.replace(new RegExp(`^${prefix}`), '');
  }

  static addPrefix(data: string, prefix: string) {
    return `${prefix}${data}`;
  }

  static get date() {
    return DateTransformer;
  }

  static toHighestUnit(value: string | bigint | number) {
    return (BigInt(value) / Transaction.TX_CONVERSION_UNIT).toString();
  }
}
