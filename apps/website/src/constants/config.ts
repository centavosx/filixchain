export class Config {
  static get version() {
    return process.env.NEXT_PUBLIC_APP_VERSION as string;
  }
  static get appUrl() {
    return process.env.APP_URL as string;
  }
  static get isDevelop() {
    return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  }

  static get sessionKey() {
    return process.env.SESSION_SECRET_KEY as string;
  }

  static get httpApiUrl() {
    return process.env.NEXT_PUBLIC_BASE_API_URL as string;
  }

  static get serverHttpApiUrl() {
    return process.env.SERVER_BASE_API_URL as string;
  }

  static get wsUrl() {
    return process.env.NEXT_PUBLIC_WS_API_URL as string;
  }

  static get userAgent() {
    return process.env.SERVER_USER_AGENT as string;
  }

  static get apiBaseUrl() {
    return `${this.httpApiUrl}/api`;
  }

  static get serverApiBaseUrl() {
    return `${this.serverHttpApiUrl}/api`;
  }

  static get cookieDomain() {
    return process.env.COOKIE_DOMAIN as string;
  }
}
