import { SignJWT, jwtVerify } from 'jose';

export class Session {
  static readonly COOKIE_ACCESS_KEY = 'access';
  static readonly HEADER_ACCESS_KEY = 'X-Access-Key';

  private _encodedKey: Uint8Array;

  constructor(key: string) {
    this._encodedKey = new TextEncoder().encode(key);
  }

  async generateToken() {
    const currentDateMs = Date.now();
    return new SignJWT({ date: currentDateMs })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1hr')
      .sign(this._encodedKey);
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
}
