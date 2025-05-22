import {useTick} from '@pixi/react';
import {WorldTraits} from '../state/traits';
import {useWorld} from 'koota/react';
import {useCallback} from 'react';
import {Ticker} from 'pixi.js';

export function useSimTick(callback: (deltaTime: number) => void) {
  const world = useWorld();

  const syncedTick = useCallback(
    (deltaTime: Ticker) => {
      const avgDelta = world.get(WorldTraits.Delta);
      callback(avgDelta?.deltaTime ?? deltaTime.deltaTime);
    },
    [callback, world],
  );

  useTick(syncedTick);
}
