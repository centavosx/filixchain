'use server';

import { Csrf } from '@ph-blockchain/csrf';
import { cache } from 'react';

const csrf = new Csrf(process.env.CSRF_SECRET_KEY as string);

export const getTokens = cache(async () => {
  return await csrf.generateTokenAndNonce();
});
