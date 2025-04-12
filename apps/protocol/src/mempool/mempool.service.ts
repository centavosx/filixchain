import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BlockGateway } from '../block/block.gateway';
import { Transaction } from '@ph-blockchain/block';
import { DbService } from '../db/db.service';
import { Account } from '../db/models/account';

@Injectable()
export class MempoolService {
  constructor(
    private readonly blockGateway: BlockGateway,
    private readonly dbService: DbService,
  ) {}

  public getMempool() {
    return {
      data: [...this.blockGateway.mempoolQueue.values()].map((value) =>
        value.serialize(),
      ),
    };
  }

  public getPendingTx(id: string) {
    const data = this.blockGateway.mempoolQueue.get(id);

    if (!data) throw new NotFoundException('Not found');

    return data.serialize();
  }

  public getMempoolFromAddress(address: string) {
    return {
      data: [
        ...(this.blockGateway.mempoolMap.get(address)?.values() ?? []),
      ].map((value) => value.serialize()),
    };
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
          account = await this.dbService.account.findByAddress(rawFromAddress);

          let userExistingTxs = this.blockGateway.mempoolMap.get(
            account.address,
          );

          if (!userExistingTxs) {
            userExistingTxs = new Map<string, Transaction>();
            this.blockGateway.mempoolMap.set(account.address, userExistingTxs);
          }

          account.addTransaction(
            ...[...userExistingTxs.values()].sort((a, b) =>
              Number(a.nonce - b.nonce),
            ),
          );
          accountTemp.set(rawFromAddress, account);
        }

        account.addTransaction(transaction);
        validatedTransactions.push(transaction);
      }

      const serializedTransactions: ReturnType<Transaction['serialize']>[] = [];

      // Add to the state once transaction has been validated
      for (const transaction of validatedTransactions) {
        const userExistingTxs = this.blockGateway.mempoolMap.get(
          transaction.rawFromAddress,
        );

        userExistingTxs.set(transaction.transactionId, transaction);

        this.blockGateway.mempoolQueue.set(
          transaction.transactionId,
          transaction,
        );

        serializedTransactions.push(transaction.serialize());
      }

      return {
        data: serializedTransactions,
      };
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
