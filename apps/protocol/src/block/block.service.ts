import { Injectable } from '@nestjs/common';

import { BlockGateway } from '../block/block.gateway';

@Injectable()
export class BlockService {
  constructor(private readonly blockGateway: BlockGateway) {}
}
