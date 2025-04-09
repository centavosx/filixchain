import { MintOrTxSerialize } from '@ph-blockchain/block';
import { BaseApi } from './base';
import { AccountTransactionSearchDto, GetAccountResult } from './types/account';
import { PaginationData } from './types/pagination';

export class Account extends BaseApi {
  private static baseEndpoint = '/account';

  static getAccount(address: string) {
    return super.get<unknown, GetAccountResult>(
      `${Account.baseEndpoint}/${address}`,
    );
  }

  static getAccountTransaction(
    address: string,
    query?: AccountTransactionSearchDto,
  ) {
    return super.get<
      AccountTransactionSearchDto,
      PaginationData<MintOrTxSerialize>
    >(`${Account.baseEndpoint}/${address}/transactions`, query);
  }
}
