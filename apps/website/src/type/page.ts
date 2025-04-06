export type Page<P = unknown, Q = unknown> = {
  params: Promise<P>;
  searchParams: Promise<Q>;
};

export type ResolvedPage<T extends Page> = {
  params: Awaited<T['params']>;
  searchParams: Awaited<T['searchParams']>;
};
