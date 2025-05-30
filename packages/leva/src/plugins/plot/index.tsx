import {createPlugin} from 'leva/plugin';
import {PlotXY} from './PlotXY';
import type {PlotXYSettings, Tracks} from './types';

export const plotXY = createPlugin({
  sanitize: (value: Tracks, _settings: PlotXYSettings = {}) => {
    if (typeof value !== 'object' || value === null) throw new Error('Expected object of tracks');
    for (const arr of Object.values(value)) {
      if (!Array.isArray(arr)) throw new Error('Each track must be an array');
    }
    return {...value};
  },
  format: (value: Tracks, _settings: PlotXYSettings = {}) => value,
  normalize: (value: Tracks) => ({value: value ?? {}}),
  component: PlotXY,
});
