import { RawBlock } from '@ph-blockchain/block';
import { BaseApi } from './base';
import {
  BlockHealthResult,
  BlockHeightQuery,
  BlockTransactionQuery,
  BlockTransactionResult,
} from './types/block';

export class Block extends BaseApi {
  private static baseEndpoint = '/block';

  static getBlocks(params: BlockHeightQuery) {
    return super.get<BlockHeightQuery, RawBlock[]>(this.baseEndpoint, params);
  }

  static getBlockByHeight(height: string | number) {
    return super.get<unknown, RawBlock>(
      `${this.baseEndpoint}/height/${height}`,
    );
  }

  static getHealth() {
    return super.get<unknown, BlockHealthResult>(`${this.baseEndpoint}/health`);
  }

  static getTransactions(params: BlockTransactionQuery) {
    return super.get<BlockTransactionQuery, BlockTransactionResult>(
      `${this.baseEndpoint}/transaction`,
      params,
    );
  }

  static getTransactionById(id: string) {
    return super.get<unknown, BlockTransactionResult['transactions'][number]>(
      `${this.baseEndpoint}/transaction/${id}`,
    );
  }
}
