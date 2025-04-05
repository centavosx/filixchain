import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import * as crypto from 'crypto';

export class Csrf {
  private _encodedKey: Uint8Array<ArrayBufferLike>;
  constructor(key: string) {
    this._encodedKey = new TextEncoder().encode(key);
  }

  async generateTokenAndNonce(exp = '5min') {
    const currentDateMs = Date.now();
    const token = await new SignJWT({
      date: currentDateMs,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(this._encodedKey);

    const nonce = this.generateNonce(token);

    return {
      token,
      nonce,
    };
  }

  async isValidToken(token: string) {
    try {
      await jwtVerify(token, this._encodedKey, {
        algorithms: ['HS256'],
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async isValidTokenAndNonce(token: string, nonce: string) {
    const isValid = await this.isValidToken(token);

    if (!isValid) return false;

    const hashedToken = this.generateNonce(token);

    if (hashedToken !== nonce) return false;

    const decodedToken = decodeJwt(token);

    const date = decodedToken?.date;

    if (!date) return false;

    return Date.now() - Number(date) <= 3 * 60 * 60 * 1000;
  }

  generateNonce(token: string) {
    const hash = crypto.createHash('sha256');
    hash.update(token);
    return hash.digest('hex');
  }
}
