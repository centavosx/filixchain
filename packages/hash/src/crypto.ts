import { AppHash } from './hash';
import * as tweetnacl from 'tweetnacl';

export class Crypto {
  static zero8BytesString = '0000000000000000';

  static encodeIntToBuffer(data: string | number | bigint) {
    const bigInt = BigInt(data);
    if (bigInt < 0) throw new Error('Minimum value is zero');
    const buffer = Buffer.alloc(8);

    buffer.writeBigInt64BE(bigInt);

    return buffer;
  }

  static encodeIntTo8BytesString(data: string | number | bigint) {
    return Crypto.encodeIntToBuffer(data).toString('hex');
  }

  static decode8BytesStringtoBigInt = (data: string) => {
    if (!data.match(/^[0-9a-fA-F]+$/)) throw new Error('Not a hex string');
    if (data.length !== 16) throw new Error('Should be a 8 byte hex string');
    const converted = +`0x${data}`;

    if (isNaN(converted)) throw new Error('Not a valid number hex string');

    return BigInt(converted);
  };

  static generateKeyPairs() {
    return tweetnacl.sign.keyPair();
  }

  static toHexString(data: string | Uint8Array) {
    return Buffer.from(data).toString('hex');
  }

  static fromHexStringToBuffer(data: string) {
    return Buffer.from(data, 'hex');
  }

  static fromHexStringToRawString(data: string) {
    return Crypto.fromHexStringToBuffer(data).toString();
  }

  static getKeyPairs(privateKey: Uint8Array) {
    const keyPair = tweetnacl.sign.keyPair.fromSecretKey(privateKey);
    return keyPair;
  }

  static getKeyPairsFromSeed(seed: Uint8Array) {
    const keyPair = tweetnacl.sign.keyPair.fromSeed(seed);
    return keyPair;
  }

  static deriveKeyPair(keypair: tweetnacl.SignKeyPair, index: number) {
    const indexBuffer = Buffer.alloc(4);
    indexBuffer.writeUInt32BE(index, 0);
    const data = Buffer.concat([keypair.secretKey, indexBuffer]);
    const newPrivateKey = AppHash.createSha512Hash(data);
    return Crypto.getKeyPairs(Buffer.from(newPrivateKey, 'hex'));
  }

  static generateWalletAddress(publicKey: Uint8Array) {
    if (publicKey.length !== 32) throw new Error('Not a valid public key');

    const hashedPublicKey = AppHash.createRipemd160(
      AppHash.createSha256Hash(Buffer.from(publicKey).toString('hex')),
    );
    return `ph-${hashedPublicKey}`;
  }

  static signMessage(privateKey: Uint8Array, message: string) {
    const messageBytes = new TextEncoder().encode(message);
    return Crypto.toHexString(
      tweetnacl.sign.detached(messageBytes, privateKey),
    );
  }

  static isValid(
    publicKey: Uint8Array,
    actualMessage: string,
    signedMessage: string,
  ) {
    try {
      const signUint8Array = new Uint8Array(
        Crypto.fromHexStringToBuffer(signedMessage),
      );
      const messageUint8Array = new TextEncoder().encode(actualMessage);
      return tweetnacl.sign.detached.verify(
        messageUint8Array,
        signUint8Array,
        publicKey,
      );
    } catch (e) {
      return false;
    }
  }
}
