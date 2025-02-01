import { Transaction } from '@ph-blockchain/block';
import { BaseApi } from './base';
import { AccountTransactionSearchDto, GetAccountResult } from './types/account';

export class Account extends BaseApi {
  private static baseEndpoint = '/account';

  static getAccount(address: string) {
    return super.get<unknown, GetAccountResult>(
      `${this.baseEndpoint}/${address}`,
    );
  }

  static getAccountTransaction(
    address: string,
    query?: AccountTransactionSearchDto,
  ) {
    return super.get<
      AccountTransactionSearchDto,
      ReturnType<Transaction['serialize']>[]
    >(`${this.baseEndpoint}/${address}/transaction`, query);
  }
}
