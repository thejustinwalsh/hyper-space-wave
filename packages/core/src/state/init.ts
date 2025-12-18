import {createWorld} from 'koota';
import {
  applyConstraints,
  pruneOutOfBounds,
  updateInstance,
  updatePlayer,
  updatePointer,
  updatePosition,
  updateVelocity,
  updateWaveScheduler,
} from './systems';
import {updateCollisions} from './collision';

// World Singleton
// @ts-expect-error: store world on globalThis for HMR
export const world = (globalThis.world = globalThis.world || createWorld());

export const systems = [
  updatePointer,
  updatePlayer,
  updateWaveScheduler,
  updatePosition,
  updateVelocity,
  applyConstraints,
  updateCollisions,
  updateInstance,
  pruneOutOfBounds,
];
