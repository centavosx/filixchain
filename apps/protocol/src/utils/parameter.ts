export class Parameter {
  static get address() {
    return {
      key: 'address',
      path: ':address([0-9a-fA-F]{40})',
    };
  }

  static get hash() {
    return {
      key: 'hashId',
      path: ':hashId([0-9a-fA-F]{64})',
    };
  }

  static get height() {
    return {
      key: 'height',
      path: ':height(\\d+)',
    };
  }
}
