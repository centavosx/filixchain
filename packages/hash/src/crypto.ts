import { AppHash } from './hash';
import * as tweetnacl from 'tweetnacl';

export class Crypto {
  static encodeNumberTo32BytesString(data: string) {
    const buffer = Buffer.alloc(32);
    buffer.writeBigInt64BE(BigInt(data), 24);
    return buffer.toString('hex');
  }

  static decode32BytesStringtoNumber(data: string) {
    const buffer = Buffer.from(data, 'hex');
    return buffer.readBigInt64BE(24);
  }

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
      console.log(e);
      return false;
    }
  }
}
