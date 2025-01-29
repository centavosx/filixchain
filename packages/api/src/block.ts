import { RawBlock } from '@ph-blockchain/block';
import { BaseApi } from './base';
import { BlockHealthResult, BlockHeightQuery } from './types/block';

export class Block extends BaseApi {
  private static baseEndpoint = '/block';

  static getBlocks(params: BlockHeightQuery) {
    return super.get<BlockHeightQuery, RawBlock[]>(this.baseEndpoint, params);
  }

  static getHealth() {
    return super.get<unknown, BlockHealthResult>(`${this.baseEndpoint}/health`);
  }
}
