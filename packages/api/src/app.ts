import { BaseApi } from './base';
import { PaginationData } from './types/pagination';
import { SerializedTransaction } from './types/transaction';

export class AppApi extends BaseApi {
  static getHealth() {
    return super.get('/health');
  }

  static search(search: string) {
    return super.get<
      {
        search: string;
      },
      {
        type: 'height' | 'mempool' | 'transaction' | 'account';
        value: string;
      }
    >('/search', { search });
  }

  static faucet(address: string) {
    return super.post<unknown, unknown, PaginationData<SerializedTransaction>>(
      '/faucet',
      {
        address,
      },
    );
  }
}
