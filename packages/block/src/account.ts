import { Crypto } from '@ph-blockchain/hash';

export class Account {
  protected _address: string;
  protected _nonce: bigint;
  protected _amount: bigint;

  constructor(address: string, amount: string, nonce: string) {
    this._address = address;
    this._nonce = Crypto.decode8BytesStringtoBigInt(nonce);
    this._amount = Crypto.decode8BytesStringtoBigInt(amount);
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
}
