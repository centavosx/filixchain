import { BaseApi } from '@ph-blockchain/api';
import { withAuth } from './wrappers/with-auth';
import { withCsp } from './wrappers/with-csp';
import { generateToken } from './lib/server/generate-tokens';
import { Config } from './constants/config';

BaseApi.init(Config.apiBaseUrl)
  .setGetToken(generateToken)
  .headers.setUserAgent(Config.userAgent);

export default withCsp({
  middleware: withAuth({}),
});

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
