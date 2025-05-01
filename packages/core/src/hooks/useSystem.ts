import {useApplication, useTick} from '@pixi/react';
import {World} from 'koota';
import {useWorld} from 'koota/react';
import {Application} from 'pixi.js';
import {measure} from '../util/perf';

export type System = (world: World, app: Application, deltaTime: number) => void;

export function useSystem(system: System) {
  const {app} = useApplication();
  const world = useWorld();

  useTick(({deltaTime}) => {
    const end = measure(system);
    system(world, app, deltaTime);
    end();
  });
}

export function useSystems(systems: System[]) {
  const world = useWorld();
  const {app} = useApplication();
  useTick(({deltaTime}) =>
    systems.forEach(system => {
      const end = measure(system);
      system(world, app, deltaTime);
      end();
    }),
  );
}
