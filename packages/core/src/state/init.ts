import {createWorld} from 'koota';
import {
  applyConstraints,
  updateInstance,
  updatePlayer,
  updatePointer,
  updatePosition,
  updateVelocity,
} from './systems';

// World Singleton
// @ts-expect-error: store world on globalThis for HMR
export const world = (globalThis.world = globalThis.world || createWorld());

export const systems = [
  updatePointer,
  updatePlayer,
  updatePosition,
  updateVelocity,
  applyConstraints,
  updateInstance,
];
