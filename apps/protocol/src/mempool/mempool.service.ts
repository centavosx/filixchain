import { ChainedBatch, Level } from 'level';

import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import * as tx from '@ph-blockchain/block';

@Injectable()
export class MempoolService implements OnModuleInit {
  private mempoolArray: string[] = [];
  private db: Level;

  constructor() {}

  async onModuleInit() {}

  public getMempool() {
    return this.mempoolArray;
  }

  public async postToMempool(transactionSignature: string) {
    try {
      // tx.Transaction.decode(transactionSignature);
      // this.mempoolArray.push(transactionSignature);

      // await db.put('testuser:account', transactionSignature);
      // const data = await this.db.get('testuser:account');
      // this.db.sublevel('idk').put('HEY', 'e');
      // console.log(data, await this.db.sublevel('idk').getMany(['HYE', 'YOW']));

      // const batch = this.db.batch();
      const batch = this.db.batch();
      const batchDb = batch.db;
      await batchDb.open();
      // console.log('HEy');
      const sublevel = batchDb.sublevel('test');
      await sublevel.open();
      const sublevelBatch = sublevel.batch();

      await batch.write();
      batch.close();

      return this.db.sublevel('test').getMany(['Test1', 'Test2', 'Test3']);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
