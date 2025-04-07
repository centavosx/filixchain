import { ReadonlyURLSearchParams } from 'next/navigation';

export type SearchParamParserProp<T = string> = {
  searchParams: ReadonlyURLSearchParams | Record<string, string>;
  key: string;
  validator?: (value: T) => boolean;
  transformer?: (value: string | null) => T;
  fallback?: T;
};
export const searchParamParser = <T = string>(
  prop: SearchParamParserProp<T>,
) => {
  const { searchParams, key, validator, transformer, fallback } = prop;

  const value =
    searchParams instanceof ReadonlyURLSearchParams
      ? searchParams.get(key)
      : searchParams[key];

  const transformed = transformer?.(value) ?? (value as T);
  const isValid = validator?.(transformed) ?? true;

  return isValid ? transformed : (fallback ?? transformed);
};
