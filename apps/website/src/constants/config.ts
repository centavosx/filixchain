export class Config {
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
    console.log(this.httpApiUrl);
    return `${this.httpApiUrl}/api`;
  }

  static get serverApiBaseUrl() {
    console.log(this.serverHttpApiUrl);
    return `${this.serverHttpApiUrl}/api`;
  }
}
