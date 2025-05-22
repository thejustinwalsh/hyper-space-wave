import {useApplication, useTick} from '@pixi/react';
import {World} from 'koota';
import {useWorld} from 'koota/react';
import {Application} from 'pixi.js';
import {measure} from '../util/perf';
import {useRef, useCallback} from 'react';
import {WorldTraits} from '../state/traits';

export type System = (world: World, app: Application, deltaTime: number) => void;

const TARGET_FPS = 60;
const TARGET_DELTA = 1000 / TARGET_FPS;
const MIN_FPS = 28;
const MIN_DELTA = 1000 / MIN_FPS;
const MAX_UPDATES_PER_FRAME = 5; // Prevent spiral of death
const RECOVERY_RATE = 0.1; // How quickly to recover to full speed (0-1) - very slow for ~10 second recovery
const FRAME_HISTORY_SIZE = 10; // Number of frames to average over

interface SystemState {
  accumulator: number;
  lastUpdateTime: number;
  updateInterval: number; // Current interval between updates in ms
  targetInterval: number; // Target interval we're lerping towards
  frameDeltas: number[]; // Rolling history of frame deltas
}

type UpdateCallback = (deltaTime: number) => void;

function useFixedTimestep(updateCallback: UpdateCallback) {
  const world = useWorld();
  const state = useRef<SystemState>({
    accumulator: 0,
    lastUpdateTime: 0,
    updateInterval: TARGET_DELTA,
    targetInterval: TARGET_DELTA,
    frameDeltas: [],
  });

  // Initialize the AverageDelta trait if it doesn't exist
  if (!world.has(WorldTraits.Delta)) {
    world.add(WorldTraits.Delta({deltaTime: 0, fps: 0}));
  }

  const update = useCallback(() => {
    const currentTime = performance.now();
    const frameDelta = currentTime - state.current.lastUpdateTime;
    state.current.lastUpdateTime = currentTime;

    // Update frame delta history
    state.current.frameDeltas.push(frameDelta);
    if (state.current.frameDeltas.length > FRAME_HISTORY_SIZE) {
      state.current.frameDeltas.shift();
    }

    // Calculate average frame delta
    const avgFrameDelta =
      state.current.frameDeltas.reduce((a, b) => a + b, 0) / state.current.frameDeltas.length;

    // Calculate target interval based on average performance
    if (avgFrameDelta > MIN_DELTA) {
      // We're running slow, immediately set both current and target interval
      const newInterval = Math.min(avgFrameDelta, MIN_DELTA * 2);
      state.current.updateInterval = newInterval;
      state.current.targetInterval = newInterval;
    } else {
      // We're running fine, set target to normal speed
      state.current.targetInterval = TARGET_DELTA;
      // Calculate how far we are from target (0 = at target, 1 = maximum distance)
      const distanceFromTarget =
        Math.abs(state.current.updateInterval - TARGET_DELTA) / (MIN_DELTA * 2 - TARGET_DELTA);
      // Dynamic recovery rate - starts slower and accelerates as we get closer
      const dynamicRecoveryRate = RECOVERY_RATE * (1 - distanceFromTarget * 0.8); // 0.8 means we keep at least 20% of the base rate
      // Smoothly lerp current interval towards target
      state.current.updateInterval +=
        (state.current.targetInterval - state.current.updateInterval) * dynamicRecoveryRate;
    }

    // Add frame delta to accumulator
    state.current.accumulator += frameDelta;

    // Run fixed timestep updates with the current interval
    let updatesThisFrame = 0;
    while (
      state.current.accumulator >= state.current.updateInterval &&
      updatesThisFrame < MAX_UPDATES_PER_FRAME
    ) {
      updateCallback(TARGET_DELTA / 1000); // Always use fixed timestep for updates
      state.current.accumulator -= state.current.updateInterval;
      updatesThisFrame++;
    }

    // If we still have updates to do but hit the cap, keep the remainder in the accumulator
    if (
      updatesThisFrame === MAX_UPDATES_PER_FRAME &&
      state.current.accumulator >= state.current.updateInterval
    ) {
      // We're falling behind, but we'll catch up gradually
      state.current.accumulator = Math.min(
        state.current.accumulator,
        state.current.updateInterval * 2,
      );
    }

    // Update the world trait with the total simulation delta time for this frame
    // This accounts for both the update interval and the number of updates performed
    const simulationDelta = state.current.updateInterval / TARGET_DELTA; // Ratio of current speed to target speed
    // If no updates occurred, use the base delta time scaled by our current speed
    const totalSimulationTime =
      updatesThisFrame > 0
        ? (TARGET_DELTA / 1000) * simulationDelta * updatesThisFrame // Total time simulated this frame
        : (TARGET_DELTA / 1000) * simulationDelta; // Base delta time scaled by current speed
    world.set(WorldTraits.Delta, {deltaTime: totalSimulationTime, fps: 1 / totalSimulationTime});
  }, [updateCallback, world]);

  return update;
}

export function useSystem(system: System) {
  const {app} = useApplication();
  const world = useWorld();

  const updateSystem = useCallback(
    (deltaTime: number) => {
      const end = measure(system);
      system(world, app, deltaTime);
      end();
    },
    [system, world, app],
  );

  const fixedTimestepUpdate = useFixedTimestep(updateSystem);
  useTick(() => fixedTimestepUpdate());
}

export function useSystems(systems: System[]) {
  const world = useWorld();
  const {app} = useApplication();

  const updateSystems = useCallback(
    (deltaTime: number) => {
      systems.forEach(system => {
        const end = measure(system);
        system(world, app, deltaTime);
        end();
      });
    },
    [systems, world, app],
  );

  const fixedTimestepUpdate = useFixedTimestep(updateSystems);
  useTick(() => fixedTimestepUpdate());
}
