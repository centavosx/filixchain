import { Config } from '@/constants/config';
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
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        ...(!Config.isDevelop && {
          sameSite: 'none',
          domain: Config.cookieDomain,
        }),
      });
    }

    return getResponse(response);
  };
