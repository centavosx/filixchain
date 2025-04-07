import { SignJWT, jwtVerify, decodeJwt } from 'jose';
import { sha256 } from 'js-sha256';

export class Session {
  static readonly COOKIE_ACCESS_KEY = 'access';
  static readonly COOKIE_REFRESH_KEY = 'refresh';
  static readonly HEADER_ACCESS_KEY = 'X-Access-Key';
  static readonly HEADER_REFRESH_KEY = 'X-Refresh-Key';

  static readonly REFRESH_KEY_TYPE = 'refresh';

  private _encodedKey: Uint8Array<ArrayBufferLike>;

  constructor(key: string) {
    this._encodedKey = new TextEncoder().encode(key);
  }

  signData(data: Record<string, unknown>, exp = '5min') {
    return new SignJWT(data)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(exp)
      .sign(this._encodedKey);
  }

  async generateTokens(exp = '5min') {
    const currentDateMs = Date.now();
    const accessToken = await this.signData(
      {
        date: currentDateMs,
      },
      exp,
    );

    const refreshToken = await this.signData(
      {
        hashed: sha256(accessToken),
        type: Session.REFRESH_KEY_TYPE,
      },
      '3hr',
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async getVerifiedData(token: string, currentDate?: Date) {
    try {
      const data = await jwtVerify(token, this._encodedKey, {
        algorithms: ['HS256'],
        ...(!!currentDate ? { currentDate } : {}),
      });
      return data.payload;
    } catch (error) {
      return null;
    }
  }

  async isValidToken(token: string, currentDate?: Date) {
    return !!this.getVerifiedData(token, currentDate);
  }

  async isValidTokens(token: string, refresh: string) {
    const decodedAccessToken = await this.getVerifiedData(
      token,
      new Date(Date.now() - 3 * 60 * 60 * 1000),
    );

    if (!decodedAccessToken) return false;

    const decodedRefreshToken = await this.getVerifiedData(refresh);

    if (!decodedRefreshToken) return false;

    const date = decodedAccessToken?.date;
    const hashed = decodedRefreshToken?.hashed;
    const refreshType = decodedRefreshToken?.type;

    if (
      !date ||
      hashed !== sha256(token) ||
      refreshType !== Session.REFRESH_KEY_TYPE
    )
      return false;

    return Date.now() - Number(date) <= 3 * 60 * 60 * 1000;
  }
}
