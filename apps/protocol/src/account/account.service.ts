import { Injectable, OnModuleInit } from '@nestjs/common';
import { Account } from '../db/account';
import { Blockchain } from '../db/blockchain';
import { AccountTransactionSearchDto } from '../dto/account-tx-search.dto';

@Injectable()
export class AccountService implements OnModuleInit {
  constructor() {}

  async onModuleInit() {
    await Promise.all([Account.initialize(), Blockchain.initialize()]);
  }

  public async getAccountFromAddress(address: string) {
    const data = await Account.findByAddress(address);
    return data.serialize();
  }

  public async getTransactions(
    address: string,
    query: AccountTransactionSearchDto,
  ) {
    const account = await Account.findByAddress(address);
    const data = await Account.getTx(account, query);
    return (await Blockchain.findTransactionsById(data)).map((value) =>
      value.serialize(),
    );
  }
}
