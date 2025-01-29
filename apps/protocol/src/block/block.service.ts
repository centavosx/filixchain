import { Injectable } from '@nestjs/common';

import { BlockGateway } from '../block/block.gateway';
import { Transaction } from '@ph-blockchain/block';
import { Blockchain } from '../db/blockchain';
import { BlockHeightQuery } from '../dto/block.dto';

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

  async getSupply() {
    const txSize = await Blockchain.getTxSize();
    const currentSupply = this.blockGateway.currentSupply;
    return {
      totalSupply: (
        (Blockchain.MAX_SUPPLY - currentSupply) /
        Transaction.TX_CONVERSION_UNIT
      ).toString(),
      maxSupply: (
        Blockchain.MAX_SUPPLY / Transaction.TX_CONVERSION_UNIT
      ).toString(),
      txSize: txSize.toString(),
      blocks: this.blockGateway.currentHeight.toString(),
    };
  }
}
