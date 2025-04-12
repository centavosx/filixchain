import { Session } from '@ph-blockchain/session';
import { cache } from 'react';

const session = new Session(process.env.SESSION_SECRET_KEY as string);

export const generateToken = cache(async () => {
  return await session.generateToken();
});
