import { Config } from '@/constants/config';
export const createSiteUrl = <T extends boolean>(
  endpoint?: string,
  shouldReturnUrl?: T,
) => {
  const url = `${Config.appUrl}${endpoint || ''}`;
  if (!!shouldReturnUrl) return new URL(url) as T extends true ? URL : string;
  return url as T extends true ? URL : string;
};
