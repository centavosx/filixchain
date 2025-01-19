import { Level } from 'level';

import { BadRequestException, Injectable } from '@nestjs/common';
import * as tx from '@ph-blockchain/block';

@Injectable()
export class MempoolService {
  private mempoolArray: string[] = [];
  private db: Level;

  constructor() {
    this.db = new Level('./database/accounts', { valueEncoding: 'json' });
  }

  public getMempool() {
    return this.mempoolArray;
  }

  public async postToMempool(transactionSignature: string) {
    try {
      // tx.Transaction.decode(transactionSignature);
      // this.mempoolArray.push(transactionSignature);

      // await db.put('testuser:account', transactionSignature);
      const data = await this.db.get('testuser:account');
      this.db.sublevel('idk').put('HEY', 'e');
      console.log(data, await this.db.sublevel('idk').getMany(['HYE', 'YOW']));
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
