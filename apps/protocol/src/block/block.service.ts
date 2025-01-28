import { Injectable } from '@nestjs/common';

import { BlockGateway } from '../block/block.gateway';
import { Transaction } from '@ph-blockchain/block';
import { Blockchain } from '../db/blockchain';

@Injectable()
export class BlockService {
  constructor(private readonly blockGateway: BlockGateway) {}

  async getBlocks() {
    const blocks = await Blockchain.getBlocksFromLatest(10);
    return blocks.map((value) => value.toJson());
  }

  async getSupply() {
    const currentSupply = this.blockGateway.currentSupply;
    return {
      totalSupply: (
        (Blockchain.MAX_SUPPLY - currentSupply) /
        Transaction.TX_CONVERSION_UNIT
      ).toString(),
      maxSupply: (
        Blockchain.MAX_SUPPLY / Transaction.TX_CONVERSION_UNIT
      ).toString(),
    };
  }
}
