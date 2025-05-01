import {useWorld} from 'koota/react';
import {WorldTraits} from '../state/traits';

export function useWorldTrait<T extends (typeof WorldTraits)[keyof typeof WorldTraits]>(trait: T) {
  const world = useWorld();

  if (!world.has(trait)) {
    world.add(trait);
  }

  return world.get(trait);
}
