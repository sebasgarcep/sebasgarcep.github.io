export type UnwrapPromise<T> =
  T extends Promise<infer V> ? UnwrapPromise<V> : T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LoaderType<T extends (...args: any[]) => any> = UnwrapPromise<
  ReturnType<T>
>;
