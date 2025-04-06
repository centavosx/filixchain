import { generateTokens } from '@/lib/server/generate-tokens';
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
  async (request: NextRequest): Promise<NextResponse<unknown> | Response> => {
    const response = NextResponse.next();

    const getResponse = (customResponse?: NextResponse) => {
      return (
        middleware?.(request, customResponse ?? response) ??
        customResponse ??
        response
      );
    };

    const { accessToken, refreshToken } = await generateTokens();

    response.cookies.set(Session.COOKIE_ACCESS_KEY, accessToken, {
      maxAge: 10800,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });
    response.cookies.set(Session.COOKIE_REFRESH_KEY, refreshToken, {
      maxAge: 10800,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });

    return getResponse(response);
  };
