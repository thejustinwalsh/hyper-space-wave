export type FixedLengthArray<T, N extends number> = N extends N
  ? number extends N
    ? T[] // fallback for dynamic numbers
    : FixedLengthArrayHelper<T, N, []>
  : never;

export type FixedLengthArrayHelper<
  T,
  N extends number,
  R extends readonly unknown[],
> = R['length'] extends N ? R : FixedLengthArrayHelper<T, N, readonly [...R, T]>;
