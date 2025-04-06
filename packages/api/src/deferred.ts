export class Deferred<T> {
  private _promise: Promise<T>;
  private _resolve!: (prop: T) => void;
  private _reject!: (e: unknown) => void;

  constructor() {
    this._promise = new Promise<T>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  get promise() {
    return this._promise;
  }

  get resolve() {
    return this._resolve;
  }

  get reject() {
    return this._reject;
  }
}
