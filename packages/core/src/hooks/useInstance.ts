import {useCallback} from 'react';
import {Instance, Position} from '../state/traits';
import {Entity} from 'koota';
import {Sprite, Graphics} from 'pixi.js';

export function useInstance<T extends Sprite | Graphics>(entity: Entity) {
  const setRef = useCallback(
    (ref: T | null) => {
      if (ref) {
        entity.set(Instance, {ref}, false);
        const pos = entity.get(Position);
        if (pos) ref.position.set(pos.x, pos.y);
      } else {
        entity.set(Instance, {ref: null}, false);
      }
    },
    [entity],
  );

  return {setRef};
}
