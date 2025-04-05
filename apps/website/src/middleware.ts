import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { withAuth } from './wrappers/with-auth';

export default withAuth({
  middleware: async (request: NextRequest, response: NextResponse) => {
    // Handle middleware
    return response;
  },
});
