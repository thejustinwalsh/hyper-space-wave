export const assert = <T>(condition: T, message?: string): NonNullable<T> => {
  if (process.env.NODE_ENV !== 'production' && !condition) {
    debugger;
    throw new Error(message ?? 'Assertion failed');
  }
  return condition!;
};
