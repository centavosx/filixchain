import { Injectable, OnModuleInit } from '@nestjs/common';
import { Account, Blockchain } from '@ph-blockchain/block';
import { SearchListQuery } from '@ph-blockchain/block/src/types/search';

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

  public async getTransactions(address: string, query: SearchListQuery) {
    const account = await Account.findByAddress(address);
    const data = await Account.getTx(account, query);
    return (await Blockchain.findTransactionsById(data)).map((value) =>
      value.serialize(),
    );
  }
}
