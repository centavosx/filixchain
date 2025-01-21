import { Injectable, OnModuleInit } from '@nestjs/common';
import { Blockchain } from '@ph-blockchain/block';

@Injectable()
export class BlockService implements OnModuleInit {
  async onModuleInit() {
    await Blockchain.initialize();
  }
}
