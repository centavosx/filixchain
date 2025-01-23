import { AppHash, Crypto } from '@ph-blockchain/hash';
import { Transform } from '@ph-blockchain/transformer';
import { Transaction } from './transaction';

export class Minter {
  static readonly ENCODED_SIZE = 64 + 64 + 64 + 40 + 40;

  public readonly from: string;
  public readonly to: string;
  public readonly amount: bigint;
  public readonly nonce: bigint;
  public readonly version: bigint;

  private _transactionId: string;

  constructor(data: {
    to: string;
    amount: string | number | bigint;
    nonce: string | number | bigint;
    version: string | number | bigint;
  }) {
    const { to, amount, nonce, version } = data;

    this.from = Minter.address;
    this.to = to;
    this.amount = BigInt(amount);
    this.nonce = BigInt(nonce);
    this.version = BigInt(version);
  }

  serialize() {
    return {
      transactionId: this.transactionId,
      from: this.from,
      to: this.to,
      amount: this.amount.toString(),
      nonce: this.nonce.toString(),
      version: this.version.toString(),
    };
  }

  static get rawFromAddress() {
    return '0000000000000000000000000000000000000000';
  }

  static get address() {
    return Transform.addPrefix(Minter.rawFromAddress, Transaction.prefix);
  }

  public get rawFromAddress() {
    return Minter.rawFromAddress;
  }

  public get rawToAddress() {
    return Transform.removePrefix(this.to, Transaction.prefix);
  }

  static encode(transaction: Minter) {
    const { from, to, amount, nonce, version } = transaction;

    const encodedVersion = Crypto.encodeIntTo32BytesString(version);
    const encodedNonce = Crypto.encodeIntTo32BytesString(nonce);
    const encodedAmount = Crypto.encodeIntTo32BytesString(amount);
    const fromAddress = Transform.removePrefix(from, Transaction.prefix);
    const toAddress = Transform.removePrefix(to, Transaction.prefix);

    const data = `${encodedVersion}${encodedNonce}${encodedAmount}${fromAddress}${toAddress}`;

    return data;
  }

  static buildMessage(minter: Minter) {
    return `${minter.from}${minter.to}${minter.amount}${minter.nonce}${minter.version}${minter.transactionId}`;
  }

  static decode(encodedMessage: string) {
    if (encodedMessage.length !== Minter.ENCODED_SIZE) {
      throw new Error('Not a minter');
    }

    const version = Crypto.decode32BytesStringtoBigInt(
      encodedMessage.slice(0, 64),
    ).toString();

    const nonce = Crypto.decode32BytesStringtoBigInt(
      encodedMessage.slice(64, 128),
    ).toString();
    const amount = Crypto.decode32BytesStringtoBigInt(
      encodedMessage.slice(128, 192),
    ).toString();
    const from = Transform.addPrefix(
      encodedMessage.slice(192, 232),
      Transaction.prefix,
    );

    const to = Transform.addPrefix(
      encodedMessage.slice(232, 272),
      Transaction.prefix,
    );

    if (from !== Minter.address)
      throw new Error('Mint Transaction is not correct');

    const mint = new Minter({
      version,
      to,
      amount,
      nonce,
    });

    return mint;
  }

  get transactionId() {
    if (!this._transactionId) {
      this._transactionId = `mint-${AppHash.createSha256Hash(
        `${this.from}${this.to}${this.amount}${this.nonce}${this.version}`,
      )}`;
    }
    return this._transactionId;
  }

  encode() {
    return Minter.encode(this);
  }
}
