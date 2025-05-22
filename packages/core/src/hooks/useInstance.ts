import {useCallback} from 'react';
import {Instance} from '../state/traits';
import {Entity} from 'koota';
import {Sprite, Graphics} from 'pixi.js';

export function useInstance<T extends Sprite | Graphics>(entity: Entity) {
  const setRef = useCallback(
    (ref: T | null) => {
      if (ref) {
        entity.set(Instance, {ref}, false);
      } else {
        entity.set(Instance, {ref: null}, false);
      }
    },
    [entity],
  );

  return {setRef};
}
