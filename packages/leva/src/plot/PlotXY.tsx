import {useCallback, useRef} from 'react';
import {useInputContext, Components, styled} from 'leva/plugin';
import {WebglThickLine, WebglPlot, ColorRGBA} from 'webgl-plot';
import type {Tracks, PlotXYSettings} from './types';
import {fallbackColor} from './util';
import {useCanvas3D} from './useCanvas3D';

export function PlotXY() {
  const {label, value, settings, onUpdate} = useInputContext<{
    value: Tracks;
    settings: PlotXYSettings;
  }>();

  const plotter = useRef<{lines: Record<string, WebglThickLine>; wglp: WebglPlot} | null>(null);

  const update = useCallback(
    (v: Tracks) => {
      if (!plotter.current) return;
      const {lines, wglp} = plotter.current;
      Object.entries(lines).forEach(([track, line]) => {
        const arr = v[track] || [];
        for (let i = 0; i < line.numPoints; i++) {
          const bufferIndex = Math.round((i * (arr.length - 1)) / (line.numPoints - 1));
          const y = arr[bufferIndex] ?? 0;
          line.setY(i, y);
        }
      });
      wglp.update();
    },
    [plotter],
  );

  const draw = useCallback(
    (canvas: HTMLCanvasElement, ctx: WebGLRenderingContext) => {
      ctx.clearColor(0, 0, 0, 0.33);
      ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);

      const numX = canvas.width;
      const wglp = new WebglPlot(canvas);
      const lines: Record<string, WebglThickLine> = {};

      // Determine track order
      const trackNames = settings?.sort?.length
        ? settings.sort.filter(name => value[name] !== undefined)
        : Object.keys(value);

      trackNames.forEach((track, idx) => {
        const colorArr = settings?.colors?.[track] ?? fallbackColor(idx, 0.33);
        const color = new ColorRGBA(...colorArr);
        const line = new WebglThickLine(color, numX, 0.05);
        line.lineSpaceX(-1, 2 / numX);
        wglp.addThickLine(line);
        lines[track] = line;
      });

      plotter.current = {lines, wglp};
      update(value);
    },
    [value, update, settings],
  );

  const [canvas] = useCanvas3D(draw);
  onUpdate(update);

  return (
    <>
      <Components.Row>
        <Wrapper>
          <Canvas ref={canvas} />
        </Wrapper>
      </Components.Row>
      <Components.Row input>
        <Components.Label>{label}</Components.Label>
        <Container>
          <span>{`[`}</span>
          {Object.keys(value).map((track, idx) => {
            const color = settings?.colors?.[track] ?? fallbackColor(idx, 0.8);
            const style = {
              color: `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`,
            };
            return (
              <span key={track}>
                <span style={style}>{track}</span>
                <span>{idx < Object.keys(value).length - 1 ? ', ' : ''}</span>
              </span>
            );
          })}
          <span>{`]`}</span>
        </Container>
      </Components.Row>
    </>
  );
}

const Wrapper = styled('div', {
  position: 'relative',
  height: 80,
  width: '100%',
  marginBottom: '$sm',
});

const Canvas = styled('canvas', {
  height: '100%',
  width: '100%',
});

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  gap: '$sm',
});
