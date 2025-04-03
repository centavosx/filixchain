import { Injectable, OnModuleInit } from '@nestjs/common';
import { Blockchain } from './models/blockchain';
import { Account } from './models/account';

@Injectable()
export class DbService implements OnModuleInit {
  resolver: () => void;
  promise = new Promise<void>((resolve) => {
    this.resolver = resolve;
  });

  async onModuleInit() {
    await Promise.all([Blockchain.initialize(), Account.initialize()]);
    this.resolver();
  }

  public waitForIntialization() {
    return this.promise;
  }
  get blockchain() {
    return Blockchain;
  }

  get account() {
    return Account;
  }
}
