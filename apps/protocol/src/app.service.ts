import { catchError } from './../../website/src/lib/catch-error';
import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchDto } from './dto/search-dto';
import { BlockGateway } from './block/block.gateway';
import { DbService } from './db/db.service';
import { Transform } from '@ph-blockchain/transformer';
import { Transaction } from '@ph-blockchain/block';

@Injectable()
export class AppService {
  constructor(
    private readonly blockGateway: BlockGateway,
    private readonly dbService: DbService,
  ) {}

  async search(dto: SearchDto) {
    const value = dto.search.trim();

    if (/^[0-9a-fA-F]{64}$/.test(value)) {
      const transactionFromMempoolQueue =
        this.blockGateway.mempoolQueue.get(value);

      if (!!transactionFromMempoolQueue) {
        return {
          type: 'mempool',
          value,
        };
      }

      const transaction = await catchError(
        async () => await this.dbService.blockchain.findTransactionsById(value),
      );

      if (!!transaction) {
        return {
          type: 'transaction',
          value,
        };
      }

      const block = await catchError(
        async () => await this.dbService.blockchain.findBlockByHash(value),
      );

      if (!!block) {
        return {
          type: 'height',
          value: block.height.toString(),
        };
      }
    }

    if (isFinite(Number(value))) {
      const blockUsingHeight = await catchError(
        async () =>
          await this.dbService.blockchain.getBlockByHeight(Number(value)),
      );

      if (!!blockUsingHeight) {
        return {
          type: 'height',
          value: blockUsingHeight.height.toString(),
        };
      }
    }

    const valueWithoutPrefix = Transform.removePrefix(
      value.trim(),
      Transaction.prefix,
    ).trim();

    if (/^[0-9a-fA-F]{40}$/.test(valueWithoutPrefix)) {
      const account = await catchError(
        async () =>
          await this.dbService.account.findByAddress(valueWithoutPrefix),
      );

      if (!!account) {
        return {
          type: 'account',
          value: account.address,
        };
      }
    }

    throw new NotFoundException('Not found');
  }
}
