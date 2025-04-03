import { BaseApi } from './base';
import { SerializedTransaction } from './types/transaction';

export class Mempool extends BaseApi {
  private static baseEndpoint = '/mempool';

  static getMempool() {
    return super.get<unknown, SerializedTransaction>(Mempool.baseEndpoint);
  }

  static getMempoolByAddress(address: string) {
    return super.get<unknown, SerializedTransaction>(
      `${Mempool.baseEndpoint}/address/${address}`,
    );
  }

  static subscribe(transaction: string[]) {
    return super.post<{ transaction: string[] }, unknown, void>(
      `${Mempool.baseEndpoint}/subscribe`,
      { transaction },
    );
  }
}
