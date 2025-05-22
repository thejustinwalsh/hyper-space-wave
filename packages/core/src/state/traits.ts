import {ConfigurableTrait, Entity, trait} from 'koota';
import {Texture, Spritesheet, Sprite, Graphics} from 'pixi.js';
import {SpatialHash} from '../util/spatial-hash';

export type ExtractInitializer<T> = T extends {from: (...args: infer U) => unknown} ? U[0] : never;

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
const ExtentTrait = trait({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  radius: 0,
  radiusSq: 0,
  pivot: {x: 0, y: 0},
  halfWidth: 0,
  halfHeight: 0,
  minX: 0,
  minY: 0,
  maxX: 0,
  maxY: 0,
});

export const Extent = Object.assign(ExtentTrait, {
  from: (bounds: {x: number; y: number; width: number; height: number}) =>
    ExtentTrait({
      ...bounds,
      pivot: {x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2},
      radius: Math.sqrt((bounds.width * bounds.width + bounds.height * bounds.height) / 4),
      radiusSq: (bounds.width * bounds.width + bounds.height * bounds.height) / 4,
      halfWidth: bounds.width / 2,
      halfHeight: bounds.height / 2,
      minX: bounds.x,
      minY: bounds.y,
      maxX: bounds.x + bounds.width,
      maxY: bounds.y + bounds.height,
    }),
}) as typeof ExtentTrait & {
  from: (bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => ReturnType<typeof ExtentTrait>;
};

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
export const Instance = trait<{ref: Sprite | Graphics | null}>({ref: null});

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
