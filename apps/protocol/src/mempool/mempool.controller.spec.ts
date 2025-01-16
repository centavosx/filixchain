import { Test, TestingModule } from '@nestjs/testing';
import { MempoolController } from './mempool.controller';
import { MempoolService } from './mempool.service';

describe('MempoolController', () => {
  let mempoolController: MempoolController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MempoolController],
      providers: [MempoolService],
    }).compile();

    mempoolController = app.get<MempoolController>(MempoolController);
  });

  describe('root', () => {});
});
