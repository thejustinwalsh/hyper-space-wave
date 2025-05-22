import {Entity, ExtractSchema, World} from 'koota';
import {Collider, Collision, Extent, OutOfBounds, Position, WorldTraits} from './traits';
import {SpatialHash} from '../util/spatial-hash';
import {assert} from '../util/assert';
import * as xmath from '../util/xmath';

export const checkAABBOverlap = (
  posA: ExtractSchema<typeof Position>,
  extA: ExtractSchema<typeof Extent>,
  posB: ExtractSchema<typeof Position>,
  extB: ExtractSchema<typeof Extent>,
): boolean => {
  if (posA.x + extA.maxX < posB.x + extB.minX) return false;
  if (posA.x + extA.minX > posB.x + extB.maxX) return false;
  if (posA.y + extA.maxY < posB.y + extB.minY) return false;
  if (posA.y + extA.minY > posB.y + extB.maxY) return false;

  return true;
};

export const checkCircleOverlap = (() => {
  const [worldPosA, worldPosB] = xmath.points(2);

  return (
    posA: ExtractSchema<typeof Position>,
    extA: ExtractSchema<typeof Extent>,
    posB: ExtractSchema<typeof Position>,
    extB: ExtractSchema<typeof Extent>,
  ) => {
    xmath.add(posA, extA.pivot, worldPosA);
    xmath.add(posB, extB.pivot, worldPosB);
    const distance = xmath.distanceToSq(worldPosA, worldPosB);
    const radius = extA.radius + extB.radius;
    return distance <= radius * radius;
  };
})();

const checkEntityCollisions = (
  entity: Entity,
  collider: ExtractSchema<typeof Collider>,
  position: ExtractSchema<typeof Position>,
  extent: ExtractSchema<typeof Extent>,
  grid: SpatialHash,
) => {
  const potentialCollisions = grid.query(position, extent);
  if (potentialCollisions.length === 0) return;

  const collisions: Array<{
    cell: number;
    entity: Entity;
    group: ExtractSchema<typeof Collider>['group'];
  }> = [];

  for (const {entity: other, cell, group} of potentialCollisions) {
    if (!collider.collidesWith.has(group)) continue;

    const otherPosition = assert(other.get(Position));
    const otherExtent = assert(other.get(Extent));
    if (checkAABBOverlap(position, extent, otherPosition, otherExtent)) {
      collisions.push({cell: cell, entity: other, group});
    }
  }

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

export const updateCollisions = (world: World) => {
  const collisionGrid = assert(
    world.get(WorldTraits.CollisionGrid)?.value,
    'Collision grid not initialized',
  );

  // Clear the grid and remove all collisions
  collisionGrid.clear();
  const entities = world.query(Position, Extent, Collider);

  // First pass: Insert all entities into the grid (and remove existing traits)
  for (const entity of entities) {
    const position = assert(entity.get(Position));
    const extent = assert(entity.get(Extent));
    const collider = assert(entity.get(Collider));

    // Remove existing collision traits
    entity.remove(Collision, OutOfBounds);

    // Insert into grid and add out of bounds trait if failed
    const inserted = collisionGrid.insert(entity, collider.group, position, extent);
    if (!inserted) {
      entity.add(OutOfBounds());
    }
  }

  // Second pass: Check all collisions after all entities are in the grid
  for (const entity of entities) {
    const position = assert(entity.get(Position));
    const extent = assert(entity.get(Extent));
    const collider = assert(entity.get(Collider));
    checkEntityCollisions(entity, collider, position, extent, collisionGrid);
  }
};
