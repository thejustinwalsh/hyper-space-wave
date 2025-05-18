import {World} from 'koota';
import {Application} from 'pixi.js';
import {
  Constraint,
  Extent,
  Gravity,
  Instance,
  OutOfBounds,
  Player,
  Position,
  Velocity,
  VelocityMax,
  WorldTraits,
} from './traits';
import * as xmath from '../util/xmath';
import {IS_MOBILE} from '../util/constants';

export function updatePointer(world: World, app: Application) {
  if (!world.has(WorldTraits.Pointer)) {
    world.add(WorldTraits.Pointer);
    world.add(WorldTraits.Offset(IS_MOBILE ? {x: 0, y: -60} : {x: 0, y: 0}));
  }

  const x = Math.min(app.renderer.screen.width, Math.max(0, app.renderer.events.pointer.global.x));
  const y = Math.min(app.renderer.screen.height, Math.max(0, app.renderer.events.pointer.global.y));
  world.set(WorldTraits.Pointer, {x, y});
}

export function updatePlayer(world: World) {
  const pointer = world.get(WorldTraits.Pointer) ?? {x: 0, y: 0};
  const offset = world.get(WorldTraits.Offset) ?? {x: 0, y: 0};

  world.query(Player, Position, Extent, Velocity).updateEach(([_, position, extent, velocity]) => {
    const target = {
      x: pointer.x + offset.x - extent.x - extent.width / 2,
      y: pointer.y + offset.y - extent.y - extent.height / 2,
    };
    const dir = xmath.sub(target, position);
    xmath.normalize(dir, dir);
    const distSq = xmath.distanceToSq(target, position);

    const speed = 5;
    if (distSq > speed * speed) {
      xmath.multiplyScalar(dir, speed, velocity);
    } else {
      velocity.x = velocity.y = 0;
    }
  });
}

export function updatePosition(world: World) {
  world.query(Position, Velocity).updateEach(([position, velocity]) => {
    position.x += velocity.x;
    position.y += velocity.y;
  });
}

export function updateVelocity(world: World) {
  world.query(Velocity, VelocityMax, Gravity).updateEach(([velocity, velocityMax, gravity]) => {
    if (Math.abs(velocity.y) < velocityMax.val) {
      const speed = xmath.length(velocity);
      const dir = xmath.multiplyScalar(velocity, 1 / speed, velocity);
      velocity.y += gravity.y;
      xmath.multiplyScalar(dir, speed, velocity);
    }
  });
}

export function applyConstraints(world: World) {
  world.query(Position, Extent, Constraint).updateEach(([position, extent, constraint]) => {
    const x = constraint.x - extent.x;
    const y = constraint.y - extent.y;
    const width = constraint.width;
    const height = constraint.height;

    if (position.x < x) {
      position.x = x;
    }
    if (position.x + extent.width > x + width) {
      position.x = x + width - extent.width;
    }
    if (position.y < y) {
      position.y = y;
    }
    if (position.y + extent.height > y + height) {
      position.y = y + height - extent.height;
    }
  });
}

export function updateInstance(world: World) {
  world.query(Position, Instance).updateEach(([position, instance]) => {
    instance.ref.position.set(position.x, position.y);
  });
}

export function pruneOutOfBounds(world: World) {
  world.query(OutOfBounds).updateEach((_, entity) => {
    entity.destroy();
  });
}
