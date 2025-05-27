export function fallbackColor(idx: number, alpha: number = 1): [number, number, number, number] {
  const palette: [number, number, number][] = [
    [0, 1, 0], // green
    [0, 1, 1], // cyan
    [1, 1, 0], // yellow
    [1, 0, 1], // magenta
    [0.5, 0.5, 0.5], // gray
  ];
  const [r, g, b] = palette[idx < palette.length ? idx : palette.length - 1];
  return [r, g, b, alpha];
}

export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}
