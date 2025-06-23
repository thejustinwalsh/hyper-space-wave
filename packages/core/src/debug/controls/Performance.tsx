import {useWorld} from 'koota/react';
import {WorldTraits} from '../../state/traits';
import {useMemo} from 'react';
import {useApplication, useTick} from '@pixi/react';
import {useControls} from 'leva';

import {plotXY} from '@hyper-space-wave/leva';
import {XArray} from '../../util/xarray';
import * as xmath from '../../util/xmath';

export function Performance() {
  const {app} = useApplication();
  const world = useWorld();

  const [fpsBuffer, simBuffer] = useMemo(() => {
    return [new XArray.CircularArray<number>(100), new XArray.CircularArray<number>(100)];
  }, []);

  const [_perfStats, setPerfStats] = useControls('Performance', () => {
    return {
      fps: {
        value: '',
        label: 'fps',
        editable: false,
      },
      simFPS: {
        value: '',
        label: 'sim fps',
        editable: false,
      },
      dilation: {
        value: '',
        label: 'dilation',
        editable: false,
      },
      maxFPS: {
        value: app.ticker.maxFPS.toFixed(0),
        label: 'max fps',
        min: 0,
        max: 120,
        step: 1,
        onChange: (value: number) => {
          app.ticker.maxFPS = value;
        },
      },
      plot: plotXY({
        fps: Array.from(fpsBuffer),
        sim: Array.from(simBuffer),
      }),
    };
  });

  useTick(({FPS}) => {
    const {fps, dilation} = world.get(WorldTraits.Delta) ?? {fps: FPS, dilation: 1};
    fpsBuffer.push(xmath.map(FPS, 0, 120, 0, 1) * 2 - 1);
    simBuffer.push(xmath.map(fps, 0, 120, 0, 1) * 2 - 1);
    setPerfStats({
      fps: FPS.toFixed(0),
      dilation: dilation.toFixed(2),
      simFPS: fps.toFixed(0),
      maxFPS: app.ticker.maxFPS.toFixed(0),
      plot: {fps: Array.from(fpsBuffer), sim: Array.from(simBuffer)},
    });
  });

  return null;
}
