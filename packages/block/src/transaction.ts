import { AppHash, Crypto } from '@ph-blockchain/hash';
import { Transform } from '@ph-blockchain/transformer';
import { RawTransaction, TransactionSignature } from './types';
import { Block } from './block';

export class Transaction {
  static MEMO_MAX_BYTES = 255;

  static prefix = 'ph-';
  static readonly BYTES_STRING_SIZES = [16, 16, 16, 64, 40, 40, 128] as const;
  static readonly ENCODED_SIZE = Transaction.BYTES_STRING_SIZES.reduce(
    (accumulator, value) => accumulator + value,
    0,
  );

  public static readonly TX_CONVERSION_UNIT = BigInt(1_000_000_000);
  public static readonly FIXED_FEE = BigInt(10_000_000);
  public static readonly BYTES_FEE = BigInt(1_000_000);

  public readonly from: string;
  public readonly to: string;
  public readonly amount: bigint;
  public readonly nonce: bigint;
  public readonly version: bigint;
  public readonly memoInByteString?: string;
  public readonly totalMemoBytesFee: bigint;
  private _timestamp?: bigint;
  private _blockHeight?: bigint;

  private _transactionId: string;

  public signature?: TransactionSignature;

  constructor(data: RawTransaction) {
    const {
      from,
      to,
      amount,
      nonce,
      version,
      signature,
      timestamp,
      blockHeight,
      memo,
    } = data;

    if (!/^ph-[0-9a-fA-F]{40}$/.test(from)) {
      throw new Error('From is not a valid wallet address');
    }

    if (!/^ph-[0-9a-fA-F]{40}$/.test(to)) {
      throw new Error('To is not a valid wallet address');
    }

    const currentEncodedMemo =
      typeof memo === 'string' ? new TextEncoder().encode(memo) : memo;

    this.from = from;
    this.to = to;
    this.amount = BigInt(amount);
    this.nonce = BigInt(nonce);
    this.version = BigInt(version);
    this.signature = signature;
    this._timestamp = timestamp ? BigInt(timestamp) : undefined;
    this._blockHeight =
      blockHeight !== undefined ? BigInt(blockHeight) : undefined;

    this.memoInByteString = !!currentEncodedMemo
      ? Buffer.from(currentEncodedMemo).toString('hex')
      : undefined;

    this.totalMemoBytesFee =
      BigInt(currentEncodedMemo?.length ?? 0) * Transaction.BYTES_FEE;
  }

  addBlock(block: Block) {
    this._timestamp = BigInt(block.timestamp);
    this._blockHeight = BigInt(block.height);
  }

  serialize() {
    return {
      transactionId: this.transactionId,
      from: this.from,
      to: this.to,
      amount: this.amount.toString(),
      nonce: this.nonce.toString(),
      version: this.version.toString(),
      signature: this.signature?.signedMessage,
      fixedFee: Transaction.FIXED_FEE.toString(),
      timestamp: this._timestamp?.toString(),
      blockHeight: this._blockHeight?.toString(),
      memo: this.memoInByteString,
      additionalFee: this.totalMemoBytesFee?.toString(),
    };
  }

  public get timestamp() {
    return this._timestamp;
  }

  public get blockHeight() {
    return this._blockHeight;
  }

  public get rawFromAddress() {
    return Transform.removePrefix(this.from, Transaction.prefix);
  }

  public get rawToAddress() {
    return Transform.removePrefix(this.to, Transaction.prefix);
  }

  static encode(transaction: Transaction) {
    const { from, to, amount, nonce, version, signature, memoInByteString } =
      transaction;

    if (!signature?.publicKey || !signature?.signedMessage)
      throw new Error(
        'Public key and signed message is not added in the signature field',
      );

    const { publicKey = '', signedMessage = '' } = signature ?? {};

    const encodedVersion = Crypto.encodeIntTo8BytesString(version);
    const encodedNonce = Crypto.encodeIntTo8BytesString(nonce);
    const encodedAmount = Crypto.encodeIntTo8BytesString(amount);
    const encodedPublicKey = Crypto.toHexString(publicKey);
    const fromAddress = Transform.removePrefix(from, this.prefix);
    const toAddress = Transform.removePrefix(to, this.prefix);

    const data = `${encodedVersion}${encodedNonce}${encodedAmount}${encodedPublicKey}${fromAddress}${toAddress}${signedMessage}${memoInByteString ?? ''}`;

    return data;
  }

  static buildMessage(transaction: Transaction) {
    return `${transaction.from}${transaction.to}${transaction.amount}${transaction.nonce}${transaction.version}${transaction.memoInByteString ?? ''}${transaction.transactionId}`;
  }

  static decode(encodedMessage: string, block?: Block) {
    if (encodedMessage.length < Transaction.ENCODED_SIZE) {
      throw new Error('Not a transaction');
    }

    const [_, slices] = Transaction.BYTES_STRING_SIZES.reduce(
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
    const amount = Crypto.decode8BytesStringtoBigInt(slices[2]).toString();
    const publicKey = Crypto.fromHexStringToBuffer(slices[3]);
    const fromAddress = Transform.addPrefix(slices[4], this.prefix);
    const toAddress = Transform.addPrefix(slices[5], this.prefix);

    const signature = slices[6];

    const memoInBytesString = encodedMessage.slice(Transaction.ENCODED_SIZE);

    const currentPublicKeyWalletAddress =
      Crypto.generateWalletAddress(publicKey);

    if (currentPublicKeyWalletAddress !== fromAddress)
      throw new Error('Transaction is from a different wallet address');

    const transaction = new Transaction({
      version,
      from: currentPublicKeyWalletAddress,
      to: toAddress,
      amount,
      nonce,
      signature: {
        publicKey: new Uint8Array(publicKey),
        signedMessage: signature,
      },
      timestamp: block?.timestamp,
      blockHeight: block?.height,
      memo: !!memoInBytesString
        ? new Uint8Array(Buffer.from(memoInBytesString, 'hex'))
        : undefined,
    });

    const message = Transaction.buildMessage(transaction);

    if (
      !transaction.signature?.publicKey ||
      !transaction.signature?.signedMessage
    )
      throw new Error('Public key or signature is required');

    const isValidMessage = Crypto.isValid(
      transaction.signature?.publicKey,
      message,
      signature,
    );

    if (!isValidMessage)
      throw new Error('This is not a valid transaction encoded message');

    return transaction;
  }

  get transactionId() {
    if (!this._transactionId) {
      this._transactionId = AppHash.createSha256Hash(
        `${this.from}${this.to}${this.amount}${this.nonce}${this.version}${this.memoInByteString ?? ''}`,
      );
    }
    return this._transactionId;
  }

  sign(privateKey: Uint8Array) {
    const keyPair = Crypto.getKeyPairs(privateKey);
    const message = Crypto.signMessage(
      privateKey,
      Transaction.buildMessage(this),
    );

    this.signature = {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.secretKey,
      signedMessage: message,
    };

    return this;
  }

  encode() {
    return Transaction.encode(this);
  }
}
