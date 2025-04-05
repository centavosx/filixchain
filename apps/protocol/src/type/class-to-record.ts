export type ClassToRecord<T extends object> = {
  [K in keyof T]: T[K];
};
