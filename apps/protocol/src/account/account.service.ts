import { Injectable, OnModuleInit } from '@nestjs/common';
import { Account } from '@ph-blockchain/block';

@Injectable()
export class AccountService implements OnModuleInit {
  constructor() {}

  async onModuleInit() {
    Account.initialize();
  }

  public async getAccountFromAddress(address: string) {
    const data = await Account.findByAddress(address);
    return data.serialize();
  }
}
