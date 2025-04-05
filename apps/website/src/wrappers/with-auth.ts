import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/server/get-tokens';

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

    const { token, nonce } = await getTokens();

    response.cookies.set('session', token, {
      maxAge: 10800,
      sameSite: 'strict',
      secure: false,
      // Setting this to true means the cookie can only be modified through server actions, handlers, middleware.
      httpOnly: true,
    });
    response.cookies.set('nonce', nonce, {
      maxAge: 10800,
      sameSite: 'strict',
      secure: false,
      // Setting this to true means the cookie can only be modified through server actions, handlers, middleware.
      httpOnly: true,
    });

    return getResponse(response);
  };
