import { Config } from '@/constants/config';
import { Session } from '@ph-blockchain/session';
import { NextRequest, NextResponse, userAgent } from 'next/server';

export type WithAuthOpts = {
  middleware?: (
    request: NextRequest,
    response: NextResponse,
  ) => Promise<NextResponse<unknown>>;
};
export const withCsp =
  ({ middleware }: WithAuthOpts = {}) =>
  async (
    request: NextRequest,
    _response: NextResponse,
  ): Promise<NextResponse<unknown>> => {
    const { browser } = userAgent(request);

    const response = NextResponse.next({
      headers: _response.headers,
    });

    if (!browser.major || !browser.name) {
      const newResponse = NextResponse.rewrite(
        new URL('/not-found', request.url),
      );
      newResponse.cookies.delete(Session.COOKIE_ACCESS_KEY);
      return newResponse;
    }

    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

    const cspHeader = `
        default-src 'self';
        script-src 'self' 'nonce-${nonce}' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
        connect-src 'self' ${Config.httpApiUrl} ${Config.wsUrl};
    `;

    const contentSecurityPolicyHeaderValue = cspHeader
      .replace(/\s{2,}/g, ' ')
      .trim();

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);

    response.headers.set('x-nonce', nonce);
    response.headers.set(
      'Content-Security-Policy',
      contentSecurityPolicyHeaderValue,
    );

    return middleware?.(request, response) ?? response;
  };
