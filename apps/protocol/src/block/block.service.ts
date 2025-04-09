import { Injectable } from '@nestjs/common';

import { BlockGateway } from '../block/block.gateway';
import { BlockHeightQuery, BlockTransactionQuery } from '../dto/block.dto';
import { DbService } from '../db/db.service';

@Injectable()
export class BlockService {
  constructor(
    private readonly blockGateway: BlockGateway,
    private readonly dbService: DbService,
  ) {}

  async getBlocks({
    page,
    start = 0,
    end,
    limit = 20,
    reverse,
    ...rest
  }: BlockHeightQuery) {
    let currentEnd = end ?? this.blockGateway.currentHeight;

    if (page !== undefined) {
      if (reverse) {
        currentEnd = currentEnd - limit * (page - 1) - 1;
      } else {
        start += limit * (page - 1);
      }
    }

    const blocks = await this.dbService.blockchain.getBlocksByHeight({
      start,
      end: currentEnd,
      limit,
      reverse,
      ...rest,
    });

    return blocks;
  }

  getHealth() {
    return this.blockGateway.getHealth();
  }

  async getTransactions({
    reverse,
    lastBlockHeight,
    ...rest
  }: BlockTransactionQuery) {
    return this.dbService.blockchain.getTransactions({
      ...rest,
      lastBlockHeight:
        lastBlockHeight ?? (reverse ? this.blockGateway.currentHeight : 0),
      reverse,
    });
  }

  async getTransactionDetail(hash: string) {
    const txDetail = await this.dbService.blockchain.findTransactionsById(
      hash,
      false,
      true,
    );
    return txDetail.serialize();
  }

  async getBlockByHeight(height: number) {
    const data = await this.dbService.blockchain.getBlockByHeight(height);
    return data.toJson(true);
  }

  async getBlockByHash(hash: string) {
    const data = await this.dbService.blockchain.findBlockByHash(hash);
    return data.toJson(false);
  }
}
