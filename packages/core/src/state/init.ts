import {createWorld} from 'koota';
import {
  applyConstraints,
  updateInstance,
  updatePlayer,
  updatePointer,
  updatePosition,
  updateVelocity,
} from './systems';

export const world = createWorld();
export const systems = [
  updatePointer,
  updatePlayer,
  updatePosition,
  updateVelocity,
  applyConstraints,
  updateInstance,
];
