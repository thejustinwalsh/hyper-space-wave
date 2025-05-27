import {useEffect, useRef} from 'react';
import {debounce} from './util';

export function useCanvas3D(
  fn: (canvas: HTMLCanvasElement, ctx: WebGLRenderingContext) => void,
): [React.RefObject<HTMLCanvasElement | null>, React.RefObject<WebGLRenderingContext | null>] {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const ctx = useRef<WebGLRenderingContext | null>(null);
  const hasFired = useRef(false);

  useEffect(() => {
    const handleCanvas = debounce(() => {
      if (canvas.current?.offsetWidth !== 0 && canvas.current?.offsetHeight !== 0) {
        canvas.current!.width = canvas.current!.offsetWidth * window.devicePixelRatio;
        canvas.current!.height = canvas.current!.offsetHeight * window.devicePixelRatio;
      }
      fn(canvas.current!, ctx.current!);
    }, 250);
    window.addEventListener('resize', handleCanvas);
    if (!hasFired.current) {
      handleCanvas();
      hasFired.current = true;
    }
    return () => window.removeEventListener('resize', handleCanvas);
  }, [fn]);

  useEffect(() => {
    ctx.current = canvas.current!.getContext('webgl', {
      antialias: true,
      transparent: false,
    }) as WebGLRenderingContext | null;
  }, []);

  return [canvas, ctx];
}
