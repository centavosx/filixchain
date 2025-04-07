import { NextRequest, NextResponse } from 'next/server';

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
    const response = NextResponse.next({
      headers: _response.headers,
    });

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
        connect-src 'self' http://localhost:3002 ws://localhost:3002;
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
