import { Injectable } from '@nestjs/common';

import { BlockGateway } from '../block/block.gateway';
import { Blockchain } from '../db/blockchain';
import { BlockHeightQuery, BlockTransactionQuery } from '../dto/block.dto';

@Injectable()
export class BlockService {
  constructor(private readonly blockGateway: BlockGateway) {}

  async getBlocks({ start = 0, end, limit = 20, ...rest }: BlockHeightQuery) {
    const blocks = await Blockchain.getBlocksByHeight({
      start,
      end: end ?? this.blockGateway.currentHeight,
      limit,
      ...rest,
    });
    return blocks;
  }

  async getHealth() {
    const txSize = await Blockchain.getTxSize();
    const currentSupply = this.blockGateway.currentSupply;
    return {
      totalSupply: (Blockchain.MAX_SUPPLY - currentSupply).toString(),
      maxSupply: Blockchain.MAX_SUPPLY.toString(),
      txSize: txSize.toString(),
      blocks: this.blockGateway.currentHeight.toString(),
    };
  }

  async getTransactions({
    reverse,
    lastBlockHeight,
    ...rest
  }: BlockTransactionQuery) {
    return Blockchain.getTransactions({
      ...rest,
      lastBlockHeight:
        lastBlockHeight ?? (reverse ? this.blockGateway.currentHeight : 0),
      reverse,
    });
  }

  async getTransactionDetail(hash: string) {
    const txDetail = await Blockchain.findTransactionsById(hash, false, true);
    return txDetail.serialize();
  }

  async getBlockByHeight(height: number) {
    const data = await Blockchain.getBlockByHeight(height);
    return data.toJson(true);
  }

  async getBlockByHash(hash: string) {
    const data = await Blockchain.findBlockByHash(hash);
    return data.toJson(true);
  }
}
