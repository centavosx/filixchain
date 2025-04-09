export type PaginationData<T, E extends Record<string, unknown> = {}> = {
  data: T[];
  totalPages?: number;
} & E;
