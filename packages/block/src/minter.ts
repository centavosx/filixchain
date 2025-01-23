import { AppHash, Crypto } from '@ph-blockchain/hash';
import { Transform } from '@ph-blockchain/transformer';
import { Transaction } from './transaction';

export class Minter {
  static readonly BYTES_STRING_SIZES = [16, 16, 16, 40, 40] as const;
  static readonly ENCODED_SIZE = Minter.BYTES_STRING_SIZES.reduce(
    (accumulator, value) => accumulator + value,
    0,
  );
  static readonly FIX_MINT = Transaction.TX_CONVERSION_UNIT * BigInt(10);

  public readonly from: string;
  public readonly to: string;
  public readonly amount = Minter.FIX_MINT;
  public readonly nonce: bigint;
  public readonly version: bigint;

  private _transactionId: string;

  constructor(data: {
    to: string;
    nonce: string | number | bigint;
    version: string | number | bigint;
  }) {
    const { to, nonce, version } = data;

    this.from = Minter.address;
    this.to = to;
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

    const encodedVersion = Crypto.encodeIntTo8BytesString(version);
    const encodedNonce = Crypto.encodeIntTo8BytesString(nonce);
    const encodedAmount = Crypto.encodeIntTo8BytesString(amount);
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

    const [_, slices] = Minter.BYTES_STRING_SIZES.reduce(
      (accumulator, value) => {
        const start = accumulator[0];
        const end = start + value;
        const slicedString = encodedMessage.slice(start, end);
        accumulator[0] = end;
        accumulator[1].push(slicedString);
        return accumulator;
      },
      [0, []] as [number, string[]],
    );

    const version = Crypto.decode8BytesStringtoBigInt(slices[0]).toString();

    const nonce = Crypto.decode8BytesStringtoBigInt(slices[1]).toString();
    const amount = Crypto.decode8BytesStringtoBigInt(slices[2]);
    const from = Transform.addPrefix(slices[3], Transaction.prefix);

    const to = Transform.addPrefix(slices[4], Transaction.prefix);

    if (amount !== Minter.FIX_MINT) throw new Error('Not a valid mint');

    if (from !== Minter.address)
      throw new Error('Mint Transaction is not correct');

    const mint = new Minter({
      version,
      to,
      nonce,
    });

    return mint;
  }

  get transactionId() {
    if (!this._transactionId) {
      this._transactionId = AppHash.createSha256Hash(
        `${this.from}${this.to}${this.amount}${this.nonce}${this.version}`,
      );
    }
    return this._transactionId;
  }

  encode() {
    return Minter.encode(this);
  }
}
