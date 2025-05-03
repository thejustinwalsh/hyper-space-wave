import {trait} from 'koota';
import {Container, Texture, Spritesheet} from 'pixi.js';

export type ResourceType = 'image' | 'spritesheet';
export type ResourceTypes = {
  image: Texture;
  spritesheet: Spritesheet;
};

export const Position = trait({x: 0, y: 0});
export const Velocity = trait({x: 0, y: 0});
export const VelocityMax = trait({val: 0});
export const Gravity = trait({x: 0, y: 0});

export const Extent = trait({x: 0, y: 0, width: 0, height: 0});
export const Constraint = trait({x: 0, y: 0, width: 0, height: 0});

export const Instance = trait<{ref: Container}>({ref: new Container({label: 'DefaultInstance'})});

export const Resource = trait<{bundle: string; url: string; type: ResourceType}>({
  bundle: '',
  url: '',
  type: 'image',
});

export const Enemy = trait();

export const Player = trait({id: 0});

export const Loot = trait();

export const WorldTraits = Object.freeze({
  Pointer: trait({x: 0, y: 0}),
  Offset: trait({x: 0, y: 0}),
});
