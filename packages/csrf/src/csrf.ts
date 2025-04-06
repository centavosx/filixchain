import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import { sha256 } from 'js-sha256';

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

    const nonce = await this.generateNonce(token);

    return {
      token,
      nonce,
    };
  }

  async getVerifiedData(token: string) {
    try {
      const data = await jwtVerify(token, this._encodedKey, {
        algorithms: ['HS256'],
      });
      return data.payload;
    } catch (error) {
      return null;
    }
  }

  async isValidToken(token: string) {
    return !!this.getVerifiedData(token);
  }

  async isValidTokenAndNonce(token: string, nonce: string) {
    const isValid = await this.isValidToken(token);

    if (!isValid) return false;

    const hashedToken = sha256(token);

    if (!nonce || hashedToken !== token) return false;

    const decodedToken = decodeJwt(token);

    const date = decodedToken?.date;

    if (!date) return false;

    return Date.now() - Number(date) <= 3 * 60 * 60 * 1000;
  }

  async generateNonce(token: string) {
    return sha256(token);
  }
}
