import { AppHash, Crypto } from '@ph-blockchain/hash';
import { Transform } from '@ph-blockchain/transformer';

export type KeyPairs = {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
};

export type TransactionSignature = Partial<
  KeyPairs & {
    signedMessage: string;
  }
>;

export type RawTransaction = {
  from: string;
  to: string;
  amount: bigint | string | number;
  nonce: bigint | string | number;
  version: bigint | string | number;
  signature?: TransactionSignature;
};

export class Transaction {
  // MILLION PESOS is our main unit
  // [MILLION, THOUSAND,  HUNDRED, PESOS, CENTAVOS, CHAIN CENTAVOS]
  public readonly CONVERSION_UNITS = [1, 100, 1000];
  public readonly from: string;
  public readonly to: string;
  public readonly amount: bigint;
  public readonly nonce: bigint;
  public readonly version: bigint;

  public signature?: TransactionSignature;

  constructor(data: RawTransaction) {
    const { from, to, amount, nonce, version, signature } = data;

    this.from = from;
    this.to = to;
    this.amount = BigInt(amount);
    this.nonce = BigInt(nonce);
    this.version = BigInt(version);
    this.signature = signature;
  }

  static prefix = 'ph-';

  static readonly ENCODED_SIZE = 64 + 64 + 64 + 64 + 40 + 40 + 128;

  static encode(transaction: Transaction) {
    const { from, to, amount, nonce, version, signature } = transaction;

    if (!signature?.publicKey || !signature?.signedMessage)
      throw new Error(
        'Public key and signed message is not added in the signature field',
      );

    const { publicKey, signedMessage } = signature;

    const encodedVersion = Crypto.encodeIntTo32BytesString(version);
    const encodedNonce = Crypto.encodeIntTo32BytesString(nonce);
    const encodedAmount = Crypto.encodeIntTo32BytesString(amount);
    const encodedPublicKey = Crypto.toHexString(publicKey);
    const fromAddress = Transform.removePrefix(from, this.prefix);
    const toAddress = Transform.removePrefix(to, this.prefix);

    const data = `${encodedVersion}${encodedNonce}${encodedAmount}${encodedPublicKey}${fromAddress}${toAddress}${signedMessage}`;

    return data;
  }

  static buildMessage(transaction: Transaction) {
    return `${transaction.from}${transaction.to}${transaction.amount}${transaction.nonce}${transaction.version}${transaction.transactionId}`;
  }

  static decode(encodedMessage: string) {
    if (encodedMessage.length !== Transaction.ENCODED_SIZE) {
      throw new Error('Not a transaction');
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
    const publicKey = Crypto.fromHexStringToBuffer(
      encodedMessage.slice(192, 256),
    );
    const fromAddress = Transform.addPrefix(
      encodedMessage.slice(256, 296),
      this.prefix,
    );
    const toAddress = Transform.addPrefix(
      encodedMessage.slice(296, 336),
      this.prefix,
    );

    const signature = encodedMessage.slice(336, 464);

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
    return AppHash.createSha256Hash(
      `${this.from}${this.to}${this.amount}${this.nonce}${this.version}`,
    );
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
