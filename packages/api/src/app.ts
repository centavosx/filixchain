import { BaseApi } from './base';

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
}
