import {createActions, ExtractSchema} from 'koota';
import {
  Constraint,
  Enemy,
  Extent,
  Gravity,
  Loot,
  Player,
  Position,
  Velocity,
  VelocityMax,
  WorldTraits,
} from './traits';
import * as xmath from '../util/xmath';
export const actions = createActions(world => ({
  spawnEnemy: (position: ExtractSchema<typeof Position>) => {
    world.spawn(Enemy, Position({...position}));
  },
  spawnPlayer: (
    position: ExtractSchema<typeof Position>,
    bounds: ExtractSchema<typeof Extent>,
    constraint: ExtractSchema<typeof Constraint>,
  ) => {
    world.spawn(
      Player,
      Extent({...bounds}),
      Constraint({...constraint}),
      Position({...position}),
      Velocity({x: 0, y: 0}),
    );
  },
  spawnLoot: (position: ExtractSchema<typeof Position>) => {
    const angle = 15;
    const speed = 8;
    const gravity = 0.2;

    const theta = xmath.rad(Math.random() * angle - angle / 2);
    const dir = xmath.rotate({x: 0, y: -1}, theta);
    const vel = xmath.multiplyScalar(dir, speed, dir);

    world.spawn(
      Loot,
      Position({...position}),
      Velocity({...vel}),
      VelocityMax({val: speed}),
      Gravity({x: 0, y: gravity}),
    );
  },
  updatePointer: (position: ExtractSchema<typeof WorldTraits.Pointer>) => {
    world.set(WorldTraits.Pointer, {...position});
  },
}));
