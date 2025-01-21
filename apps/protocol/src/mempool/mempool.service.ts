import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { Account, Transaction } from '@ph-blockchain/block';

@Injectable()
export class MempoolService implements OnModuleInit {
  private mempoolMap = new Map<string, Transaction[]>();
  private mempoolQueue: Transaction[] = [];

  constructor() {}

  async onModuleInit() {
    await Account.initialize();
  }

  public getMempool() {
    return this.mempoolQueue;
  }

  public getMempoolFromAddress(address: string) {
    return this.mempoolMap.get(address) || [];
  }

  public async postToMempool(encodedTransactions: string[]) {
    try {
      const validatedTransactions: Transaction[] = [];
      const accountTemp = new Map<string, Account>();

      // The purpose of this is just to check transactions validity
      for (const encodedTransaction of encodedTransactions) {
        const transaction = Transaction.decode(encodedTransaction);
        const rawFromAddress = transaction.rawFromAddress;

        let account = accountTemp.get(rawFromAddress);

        if (!account) {
          account = await Account.findByAddress(rawFromAddress);
          let userExistingTxs = this.mempoolMap.get(account.address);

          if (!userExistingTxs) {
            userExistingTxs = [];
            this.mempoolMap.set(account.address, userExistingTxs);
          }

          account.addTransaction(
            ...userExistingTxs.sort((a, b) => Number(a.nonce - b.nonce)),
          );
          accountTemp.set(rawFromAddress, account);
        }

        account.addTransaction(transaction);
        validatedTransactions.push(transaction);
      }

      // Add to the state once transaction has been validated
      for (const transaction of validatedTransactions) {
        let userExistingTxs = this.mempoolMap.get(transaction.rawFromAddress);

        if (!userExistingTxs) {
          userExistingTxs = [];
          this.mempoolMap.set(transaction.rawFromAddress, userExistingTxs);
        }

        userExistingTxs.push(transaction);
        this.mempoolQueue.push(transaction);
      }
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
