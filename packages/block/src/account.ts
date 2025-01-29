import { Crypto } from '@ph-blockchain/hash';

export class Account {
  protected _address: string;
  protected _nonce: bigint;
  protected _amount: bigint;
  protected _size: bigint;

  constructor(address: string, amount: string, nonce: string, size: string) {
    this._address = address;
    this._nonce = Crypto.decode8BytesStringtoBigInt(nonce);
    this._amount = Crypto.decode8BytesStringtoBigInt(amount);
    this._size = Crypto.decode8BytesStringtoBigInt(size);
  }

  get address() {
    return this._address;
  }

  get nonce() {
    return this._nonce;
  }

  get amount() {
    return this._amount;
  }

  get size() {
    return this._size;
  }
}
