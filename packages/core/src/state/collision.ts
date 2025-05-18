import {Entity, ExtractSchema, World} from 'koota';
import {Application} from 'pixi.js';
import {Collider, Collision, Extent, OutOfBounds, Position, WorldTraits} from './traits';
import {SpatialHash} from '../util/spatial-hash';
import {assert} from '../util/assert';

const checkOverlap = (
  pos1: {x: number; y: number},
  ext1: {x: number; y: number; width: number; height: number},
  pos2: {x: number; y: number},
  ext2: {x: number; y: number; width: number; height: number},
): boolean => {
  const left1 = pos1.x + ext1.x;
  const right1 = left1 + ext1.width;
  const top1 = pos1.y + ext1.y;
  const bottom1 = top1 + ext1.height;

  const left2 = pos2.x + ext2.x;
  const right2 = left2 + ext2.width;
  const top2 = pos2.y + ext2.y;
  const bottom2 = top2 + ext2.height;

  // Early exit conditions
  if (right1 < left2) return false;
  if (left1 > right2) return false;
  if (bottom1 < top2) return false;
  if (top1 > bottom2) return false;

  return true;
};

const checkEntityCollisions = (
  entity: Entity,
  collider: ExtractSchema<typeof Collider>,
  position: ExtractSchema<typeof Position>,
  extent: ExtractSchema<typeof Extent>,
  grid: SpatialHash,
) => {
  const potentialCollisions = grid.query(position, extent);
  if (potentialCollisions.size === 0) return;

  const collisions: Array<{
    cell: number;
    entity: Entity;
    group: ExtractSchema<typeof Collider>['group'];
  }> = [];

  potentialCollisions.forEach((collision, other) => {
    if (!collider.collidesWith.includes(collision.group)) return;

    const otherPosition = assert(other.get(Position));
    const otherExtent = assert(other.get(Extent));

    if (checkOverlap(position, extent, otherPosition, otherExtent)) {
      collisions.push({cell: collision.cell, entity: other, group: collision.group});
    }
  });

  if (collisions.length > 0) {
    if (entity.has(Collision)) {
      entity.get(Collision)!.others.push(...collisions);
    } else {
      entity.add(
        Collision({
          group: collider.group,
          others: collisions,
        }),
      );
    }
  }
};

export const updateCollisions = (world: World, _: Application) => {
  const collisionGrid = assert(
    world.get(WorldTraits.CollisionGrid)?.value,
    'Collision grid not initialized',
  );

  // Clear the grid and remove all collisions
  collisionGrid.clear();
  const entities = world.query(Position, Extent, Collider);

  // First pass: Insert all entities into the grid
  entities.updateEach(([position, extent, collider], entity: Entity) => {
    // Remove existing collision traits
    entity.remove(Collision, OutOfBounds);

    // Insert into grid
    const inserted = collisionGrid.insert(entity, collider.group, position, extent);
    if (!inserted) {
      entity.add(OutOfBounds());
    }
  });

  // Second pass: Check all collisions after all entities are in the grid
  entities.updateEach(([position, extent, collider], entity: Entity) => {
    checkEntityCollisions(entity, collider, position, extent, collisionGrid);
  });
};
