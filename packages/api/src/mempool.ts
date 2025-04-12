import { MintOrTxSerialize } from '@ph-blockchain/block';
import { BaseApi } from './base';
import { PaginationData } from './types/pagination';
import { SerializedTransaction } from './types/transaction';

export class Mempool extends BaseApi {
  private static baseEndpoint = '/mempool';

  static getMempool() {
    return super.get<unknown, PaginationData<SerializedTransaction>>(
      Mempool.baseEndpoint,
    );
  }

  static getPendingTxById(id: string) {
    return super.get<unknown, SerializedTransaction>(
      `${Mempool.baseEndpoint}/${id}`,
    );
  }

  static getMempoolByAddress(address: string) {
    return super.get<unknown, PaginationData<SerializedTransaction>>(
      `${Mempool.baseEndpoint}/address/${address}`,
    );
  }

  static subscribe(transaction: string[]) {
    return super.post<
      { transaction: string[] },
      unknown,
      PaginationData<SerializedTransaction>
    >(`${Mempool.baseEndpoint}/subscribe`, { transaction });
  }
}
