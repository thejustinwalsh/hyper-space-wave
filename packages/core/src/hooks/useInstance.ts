import {useEffect} from 'react';

import {useRef} from 'react';
import {Instance} from '../state/traits';
import {Entity} from 'koota';
import {Container} from 'pixi.js';

export function useInstance<T extends Container>(entity: Entity) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current && entity.isAlive() && !entity.has(Instance)) {
      entity.add(Instance({ref: ref.current}));
    }
    return () => {
      if (entity.isAlive() && entity.has(Instance)) {
        entity.remove(Instance);
      }
    };
  }, [entity]);

  return ref;
}
