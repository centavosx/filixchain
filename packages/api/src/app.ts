import { BaseApi } from './base';

export class AppApi extends BaseApi {
  static getHealth() {
    return super.get('/health');
  }
}
