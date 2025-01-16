import { AppHash } from './hash';
import tweetnacl from 'tweetnacl';
import crypto from 'crypto';

export class Crypto {
  static generateKeyPairs() {
    return tweetnacl.box.keyPair();
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

  static concatToHexString(...args: (string | Uint8Array)[]) {
    return Buffer.concat(args.map((value) => Buffer.from(value))).toString(
      'hex',
    );
  }

  static getKeyPairs(privateKey: Buffer) {
    const keyPair = tweetnacl.box.keyPair.fromSecretKey(privateKey);
    return keyPair;
  }

  static generateWalletAddress(publicKey: Uint8Array, version = 1) {
    const hashedPublicKey = AppHash.createSha256Hash(
      `${Buffer.from(publicKey).toString('hex')}${version}`,
    );
    return `ph-${hashedPublicKey}`;
  }

  static signMessage(
    publicKey: Uint8Array,
    privateKey: Uint8Array,
    message: string,
  ) {
    const messageBytes = new TextEncoder().encode(message);
    return Crypto.concatToHexString(
      publicKey,
      tweetnacl.sign(messageBytes, privateKey),
    );
  }

  static validateMessage(signedMessage: string) {
    try {
      const buffer = Buffer.from(signedMessage);
      const publicKeyUint8Array = new Uint8Array(buffer.subarray(0, 32));
      const signUint8Array = new Uint8Array(buffer.subarray(32));
      const verifiedMessage = tweetnacl.sign.open(
        signUint8Array,
        publicKeyUint8Array,
      );
      if (!verifiedMessage) throw new Error('Not Valid!');

      return {};
    } catch {
      return null;
    }
  }
}
