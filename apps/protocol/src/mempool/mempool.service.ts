import { Injectable } from '@nestjs/common';

@Injectable()
export class MempoolService {
  private transactionQueue = new Map<string, string>();

  public decodeTransaction() {}
  public addTransactionInPool(transactionSignature: string) {}
}
