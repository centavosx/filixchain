export type NestedStringKey<
  T extends Record<string | number, unknown>,
  K = keyof T,
> = K extends string
  ? T[K] extends Record<string | number, unknown>
    ? K | `${K}.${NestedStringKey<T[K]>}`
    : K
  : never;

export type NestedStringValue<
  T extends Record<string | number, unknown>,
  K extends string,
> = K extends keyof T
  ? T[K]
  : K extends `${infer A}.${infer B}`
    ? T[A] extends Record<string | number, unknown>
      ? NestedStringValue<T[A], B>
      : T[A]
    : never;
