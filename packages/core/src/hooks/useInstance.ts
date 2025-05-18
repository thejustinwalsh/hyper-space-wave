import {useEffect} from 'react';

import {useRef} from 'react';
import {Instance} from '../state/traits';
import {Entity} from 'koota';
import {useTrait} from 'koota/react';
import {Container} from 'pixi.js';

export function useInstance<T extends Container>(entity: Entity) {
  const instance = useTrait(entity, Instance);
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current && !instance) {
      entity.add(Instance({ref: ref.current}));
    }
    return () => {
      if (instance) {
        entity.remove(Instance);
      }
    };
  }, [entity, instance]);
  return ref;
}
