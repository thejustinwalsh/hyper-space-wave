/**
 * Hook for managing the wave-based pattern system
 */

import {useEffect} from 'react';
import {useActions} from 'koota/react';
import {actions} from '../state/actions';
import {generateWaveSequence} from '../util/wave-generator';

export interface WaveSystemConfig {
  startDifficulty?: number; // Initial difficulty level (1-10), default: 1
  waveCount?: number; // Number of waves to generate, default: 50
  waveInterval?: number; // Time between waves in ms, default: 2000
  scrollSpeed?: number; // Base scroll speed multiplier, default: 1
  autoStart?: boolean; // Auto-start wave spawning, default: false
  seed?: number; // Random seed for reproducibility
}

/**
 * Initialize and manage the wave generation system
 */
export function useWaveSystem(config: WaveSystemConfig = {}) {
  const {
    startDifficulty = 1,
    waveCount = 50,
    waveInterval = 2000,
    scrollSpeed = 1,
    autoStart = false,
    seed,
  } = config;

  const {setupWaveScheduler, loadWaves, startWaves, stopWaves, setScrollSpeed} =
    useActions(actions);

  // Initialize wave scheduler on mount
  useEffect(() => {
    setupWaveScheduler(waveInterval, scrollSpeed);
  }, [setupWaveScheduler, waveInterval, scrollSpeed]);

  // Generate and load waves
  useEffect(() => {
    const patterns = generateWaveSequence(startDifficulty, waveCount, seed);
    loadWaves(patterns);

    if (autoStart) {
      startWaves(startDifficulty);
    }
  }, [startDifficulty, waveCount, seed, autoStart, loadWaves, startWaves]);

  return {
    startWaves: (difficulty?: number) => startWaves(difficulty || startDifficulty),
    stopWaves,
    setScrollSpeed,
    regenerateWaves: (newDifficulty?: number, newCount?: number) => {
      const patterns = generateWaveSequence(
        newDifficulty || startDifficulty,
        newCount || waveCount,
        seed,
      );
      loadWaves(patterns);
    },
  };
}
