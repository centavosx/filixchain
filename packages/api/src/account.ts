import { BaseApi } from './base';
import { GetAccountResult } from './types/account';

export class Account extends BaseApi {
  private static baseEndpoint = '/block';

  static getAccount(address: string) {
    return super.get<unknown, GetAccountResult>(
      `${this.baseEndpoint}/${address}`,
    );
  }
}
