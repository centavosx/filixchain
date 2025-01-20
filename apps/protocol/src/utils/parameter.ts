export class Parameter {
  static get address() {
    return {
      key: ':address',
      path: ':address([0-9a-fA-F]{40})',
    };
  }
}
