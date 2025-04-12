import { generateToken } from '@/lib/server/generate-tokens';
import { AppApi } from '@ph-blockchain/api';
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

    let newAccessToken: string | undefined;

    const token = request.cookies.get(Session.COOKIE_ACCESS_KEY);

    try {
      if (!token) throw new Error();
      await AppApi.getHealth();
    } catch {
      newAccessToken = await generateToken();
    }

    if (newAccessToken) {
      response.cookies.set(Session.COOKIE_ACCESS_KEY, newAccessToken, {
        maxAge: 10800,
        sameSite: 'strict',
        secure: false,
        httpOnly: true,
      });
    }

    return getResponse(response);
  };
