import {ConfigurableTrait, Entity, trait} from 'koota';
import {Container, Texture, Spritesheet} from 'pixi.js';
import {SpatialHash} from '../util/spatial-hash';

export type ResourceType = 'image' | 'spritesheet';
export type ResourceTypes = {
  image: Texture;
  spritesheet: Spritesheet;
};

// Tag traits
export const Enemy = trait();
export const Player = trait({id: 0});
export const Loot = trait();
export const Bullet = trait();

// Physics traits
export const Position = trait({x: 0, y: 0});
export const Velocity = trait({x: 0, y: 0});
export const VelocityMax = trait({val: 0});
export const Gravity = trait({x: 0, y: 0});

// Collision traits
export const Extent = trait({x: 0, y: 0, width: 0, height: 0});
export const Constraint = trait({x: 0, y: 0, width: 0, height: 0});
export const Collider = trait<{group: ConfigurableTrait; collidesWith: Set<ConfigurableTrait>}>({
  group: trait({}),
  collidesWith: new Set(),
});
export const Collision = trait<{
  group: ConfigurableTrait;
  others: {cell: number; entity: Entity; group: ConfigurableTrait}[];
}>({
  group: trait({}),
  others: [],
});
export const OutOfBounds = trait();

// Instance rendering traits
export const Instance = trait<{ref: Container | null}>({ref: null});

export const Resource = trait<{bundle: string; url: string; type: ResourceType}>({
  bundle: '',
  url: '',
  type: 'image',
});

// World traits
export const WorldTraits = Object.freeze({
  Pointer: trait({x: 0, y: 0}),
  Offset: trait({x: 0, y: 0}),
  CollisionGrid: trait<{value: SpatialHash}>({value: new SpatialHash()}),
  Delta: trait({deltaTime: 0, fps: 0}),
});
