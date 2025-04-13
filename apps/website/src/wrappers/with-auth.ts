import { generateToken } from '@/lib/server/generate-tokens';
import { Session } from '@ph-blockchain/session';
import { NextRequest, NextResponse } from 'next/server';

export type WithAuthOpts = {
  middleware?: (
    request: NextRequest,
    response: NextResponse,
  ) => Promise<NextResponse<unknown>>;
};
export const withAuth =
  ({ middleware }: WithAuthOpts) =>
  async (
    request: NextRequest,
    _response: NextResponse,
  ): Promise<NextResponse<unknown>> => {
    const response = NextResponse.next({
      headers: _response.headers,
    });

    const getResponse = (customResponse?: NextResponse) => {
      return (
        middleware?.(request, customResponse ?? response) ??
        customResponse ??
        response
      );
    };

    const token = await generateToken();

    if (token) {
      response.cookies.set(Session.COOKIE_ACCESS_KEY, token, {
        maxAge: 3600,
        sameSite: 'none',
        domain: '.filixchain.xyz',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
      });
    }

    return getResponse(response);
  };
