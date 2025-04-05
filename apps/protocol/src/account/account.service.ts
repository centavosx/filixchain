import { Injectable } from '@nestjs/common';
import { AccountTransactionSearchDto } from '../dto/account-tx-search.dto';
import { DbService } from '../db/db.service';

@Injectable()
export class AccountService {
  constructor(private readonly dbService: DbService) {}

  public async getAccountFromAddress(address: string) {
    const data = await this.dbService.account.findByAddress(address);
    return data.serialize();
  }

  public async getTransactions(
    address: string,
    query: AccountTransactionSearchDto,
  ) {
    const account = await this.dbService.account.findByAddress(address);
    const data = await this.dbService.account.getTx(account, query);
    return (
      await this.dbService.blockchain.findTransactionsById(data, false, true)
    ).map((value) => value.serialize());
  }
}
