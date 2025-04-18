export const createSiteUrl = <T extends boolean>(
  endpoint?: string,
  shouldReturnUrl?: T,
) => {
  const url = `https://${process.env.APP_URL ?? "localhost:3000"}${
    endpoint || ""
  }`;
  if (!!shouldReturnUrl) return new URL(url) as T extends true ? URL : string;
  return url as T extends true ? URL : string;
};
