import {createActions, ExtractSchema} from 'koota';
import {
  Collider,
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
import {SpatialHash} from '../util/spatial-hash';

export const actions = createActions(world => ({
  setupCollisionGrid: (
    cellSize: number,
    width: number,
    height: number,
    x: number = 0,
    y: number = 0,
  ) => {
    if (world.has(WorldTraits.CollisionGrid)) return;
    world.add(
      WorldTraits.CollisionGrid({
        value: new SpatialHash({cellSize, width, height, x, y}),
      }),
    );
  },
  spawnEnemy: (position: ExtractSchema<typeof Position>) => {
    world.spawn(Enemy, Position({...position}));
  },
  spawnPlayer: (
    id: number,
    position: ExtractSchema<typeof Position>,
    bounds: ExtractSchema<typeof Extent>,
    constraint: ExtractSchema<typeof Constraint>,
  ) => {
    const player = world.query(Player).find(p => p.get(Player)?.id === id);
    if (player) return;

    world.spawn(
      Player({id}),
      Extent({...bounds}),
      Constraint({...constraint}),
      Collider({collidesWith: [Loot, Enemy], group: Player}),
      Position({...position}),
      Velocity({x: 0, y: 0}),
    );
  },
  spawnLoot: (position: ExtractSchema<typeof Position>, bounds: ExtractSchema<typeof Extent>) => {
    const angle = 15;
    const speed = 8;
    const gravity = 0.2;

    const theta = xmath.rad(Math.random() * angle - angle / 2);
    const dir = xmath.rotate({x: 0, y: -1}, theta);
    const vel = xmath.multiplyScalar(dir, speed, dir);

    world.spawn(
      Loot,
      Position({...position}),
      Extent({...bounds}),
      Collider({group: Loot}),
      Velocity({...vel}),
      VelocityMax({val: speed}),
      Gravity({x: 0, y: gravity}),
    );
  },
  updatePointer: (position: ExtractSchema<typeof WorldTraits.Pointer>) => {
    world.set(WorldTraits.Pointer, {...position});
  },
}));
