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
    {
      page,
      start = 0,
      end,
      reverse,
      limit = 20,
      from,
      to,
    }: AccountTransactionSearchDto,
  ) {
    const account = await this.dbService.account.findByAddress(address);

    if (page !== undefined) {
      const txSize = +account.size.toString();

      if (reverse) {
        end = (end ?? txSize) - limit * (page - 1) - 1;
      } else {
        start += limit * (page - 1);
      }
    }

    const data = await this.dbService.account.getTx(account, {
      reverse,
      start,
      end,
      from,
      to,
      limit,
    });

    return (
      await this.dbService.blockchain.findTransactionsById(data, false, true)
    ).map((value) => value.serialize());
  }
}
