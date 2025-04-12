import { Config } from '@/constants/config';
import { Session } from '@ph-blockchain/session';
import { cache } from 'react';

const session = new Session(Config.sessionKey);

export const generateToken = cache(async () => {
  return await session.generateToken();
});
