import { withAuth } from './wrappers/with-auth';
import { withCsp } from './wrappers/with-csp';

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
