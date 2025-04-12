export const catchError = async <T, C = null>(
  cb: () => T,
  onError?: (e: Error) => C,
): Promise<T | C> => {
  try {
    const data = await cb();
    return data;
  } catch (e) {
    return (onError?.(e as Error) ?? null) as C;
  }
};
