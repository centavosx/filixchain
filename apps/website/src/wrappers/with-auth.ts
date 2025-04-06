import { NextRequest, NextResponse } from 'next/server';
import { generateTokens } from '@/lib/server/generate-tokens';

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

    const { token, nonce } = await generateTokens();

    response.cookies.set('XSRF-TOKEN', token, {
      maxAge: 10800,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });
    response.cookies.set('XSRF-NONCE', nonce, {
      maxAge: 10800,
      sameSite: 'strict',
      secure: false,
      httpOnly: true,
    });

    return getResponse(response);
  };
