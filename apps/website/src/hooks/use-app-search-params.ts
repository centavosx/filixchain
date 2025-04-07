import { useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

export const useAppSearchParams = <
  T extends Record<string, unknown> = Record<string, unknown>,
>() => {
  const searchParams = useSearchParams();
  const { push } = useRouter();

  const updateAndGetString = useCallback(
    (newValue: T) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));

      for (const [key, value] of Object.entries(newValue)) {
        if (!value) {
          current.delete(key);
          continue;
        }

        if (Array.isArray(value)) {
          for (const item of value) {
            if (!value) {
              current.delete(key);
              continue;
            }
            current.append(
              key,
              typeof item === 'string' ? item : JSON.stringify(item),
            );
          }
          continue;
        }

        current.set(
          key,
          typeof value === 'string' ? value : JSON.stringify(value),
        );
      }

      const search = current.toString();

      return search ? `?${search}` : '';
    },
    [searchParams],
  );

  const updateAndRedirect = useCallback(
    (newValue: T) => {
      push(updateAndGetString(newValue));
    },
    [updateAndGetString, push],
  );

  return {
    searchParams,
    updateAndGetString,
    updateAndRedirect,
  };
};
