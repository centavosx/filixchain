import { Injectable } from '@nestjs/common';

import { BlockGateway } from '../block/block.gateway';
import { Blockchain } from '@ph-blockchain/block';

@Injectable()
export class BlockService {
  constructor(private readonly blockGateway: BlockGateway) {}

  async getBlocks() {
    const blocks = await Blockchain.getBlocksFromLatest(10);
    return blocks.map((value) => value.toJson());
  }
}
