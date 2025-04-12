import { BaseApi } from '@ph-blockchain/api';
import { withAuth } from './wrappers/with-auth';
import { withCsp } from './wrappers/with-csp';
import { generateToken } from './lib/server/generate-tokens';

BaseApi.init('http://localhost:3002/api')
  .setGetToken(generateToken)
  .headers.setUserAgent('Peso-In-Blockchain-Server/1.0');

export default withAuth({
  middleware: withCsp(),
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
