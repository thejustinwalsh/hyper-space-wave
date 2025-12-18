import {createActions, ExtractSchema} from 'koota';
import {
  Collider,
  Constraint,
  Enemy,
  Extent,
  ExtractInitializer,
  Gravity,
  Instance,
  Loot,
  Player,
  Position,
  Velocity,
  VelocityMax,
  WorldTraits,
} from './traits';
import * as xmath from '../util/xmath';
import {SpatialHash} from '../util/spatial-hash';
import {assert} from '../util/assert';
import type {WavePattern} from '../util/wave-generator';

export const actions = createActions(world => {
  const spawnEnemy = (
    position: ExtractSchema<typeof Position>,
    enemyType: 'enemy1' | 'enemy2' | 'enemy3' | 'enemy4' | 'enemy5' = 'enemy1',
    velocity?: ExtractSchema<typeof Velocity>,
  ) => {
    // Enemy health based on type
    const healthMap = {
      enemy1: 1,
      enemy2: 2,
      enemy3: 3,
      enemy4: 4,
      enemy5: 5,
    };

    const health = healthMap[enemyType];
    const bounds = {x: -8, y: -8, width: 16, height: 16}; // Default enemy size

    world.spawn(
      Enemy({type: enemyType, health, maxHealth: health}),
      Position({...position}),
      Extent.from(bounds),
      Collider({collidesWith: new Set([Player]), group: Enemy}),
      Velocity(velocity ? {...velocity} : {x: 0, y: 2}), // Default downward velocity
      Instance({ref: null}),
    );
  };

  return {
    setupCollisionGrid: (
      cellSize: number,
      width: number,
      height: number,
      x: number = 0,
      y: number = 0,
    ) => {
      if (world.has(WorldTraits.CollisionGrid)) return;
      world.add(
        WorldTraits.CollisionGrid({
          value: new SpatialHash({cellSize, width, height, x, y}),
        }),
      );
    },
    setupWaveScheduler: (waveInterval?: number, scrollSpeed?: number) => {
      if (!world.has(WorldTraits.WaveScheduler)) {
        world.add(
          WorldTraits.WaveScheduler({
            waveInterval: waveInterval ?? 2000,
            scrollSpeed: scrollSpeed ?? 1,
          }),
        );
      }
      if (!world.has(WorldTraits.GameState)) {
        world.add(WorldTraits.GameState());
      }
    },
    spawnEnemy,
    spawnPlayer: (
      id: number,
      position: ExtractSchema<typeof Position>,
      bounds: ExtractInitializer<typeof Extent>,
      constraint: ExtractSchema<typeof Constraint>,
    ) => {
      const player = world.query(Player).find(p => p.get(Player)?.id === id);
      if (player) return;

      world.spawn(
        Player({id}),
        Extent.from(bounds),
        Constraint({...constraint}),
        Collider({collidesWith: new Set([Loot, Enemy]), group: Player}),
        Position({...position}),
        Velocity({x: 0, y: 0}),
        Instance({ref: null}),
      );
    },
    spawnLoot: (
      position: ExtractSchema<typeof Position>,
      bounds: ExtractInitializer<typeof Extent>,
    ) => {
      const angle = 15;
      const speed = 8;
      const gravity = 0.2;

      const theta = xmath.rad(Math.random() * angle - angle / 2);
      const dir = xmath.rotate({x: 0, y: -1}, theta);
      const vel = xmath.multiplyScalar(dir, speed, dir);

      world.spawn(
        Loot,
        Position({...position}),
        Extent.from(bounds),
        Collider({group: Loot}),
        Velocity({...vel}),
        VelocityMax({val: speed}),
        Gravity({x: 0, y: gravity}),
        Instance({ref: null}),
      );
    },
    updatePointer: (position: ExtractSchema<typeof WorldTraits.Pointer>) => {
      world.set(WorldTraits.Pointer, {...position});
    },
    loadWaves: (waves: WavePattern[]) => {
      const scheduler = assert(world.get(WorldTraits.WaveScheduler));
      world.set(WorldTraits.WaveScheduler, {
        ...scheduler,
        waves: waves.map(w => ({
          id: w.id,
          columns: w.columns,
          speed: w.speed,
          drops: w.drops,
          difficulty: w.difficulty,
        })),
        currentWaveIndex: 0,
        waveTimer: 0,
      });
    },
    startWaves: (difficulty: number = 1) => {
      const scheduler = assert(world.get(WorldTraits.WaveScheduler));
      const gameState = assert(world.get(WorldTraits.GameState));

      world.set(WorldTraits.WaveScheduler, {
        ...scheduler,
        isActive: true,
        difficulty,
        gameTime: 0,
        currentWaveIndex: 0,
        waveTimer: 0,
      });

      world.set(WorldTraits.GameState, {
        ...gameState,
        isPlaying: true,
        isPaused: false,
      });
    },
    stopWaves: () => {
      const scheduler = assert(world.get(WorldTraits.WaveScheduler));
      world.set(WorldTraits.WaveScheduler, {
        ...scheduler,
        isActive: false,
      });
    },
    pauseGame: () => {
      const gameState = assert(world.get(WorldTraits.GameState));
      world.set(WorldTraits.GameState, {
        ...gameState,
        isPaused: !gameState.isPaused,
      });
    },
    setScrollSpeed: (speed: number) => {
      const scheduler = assert(world.get(WorldTraits.WaveScheduler));
      world.set(WorldTraits.WaveScheduler, {
        ...scheduler,
        scrollSpeed: speed,
      });
    },
    spawnWave: (waveIndex: number, offsetY: number = 0) => {
      console.log('Spawning wave', waveIndex);
      const scheduler = assert(world.get(WorldTraits.WaveScheduler));
      if (waveIndex >= scheduler.waves.length) return;

      const wave = scheduler.waves[waveIndex];
      const columnWidth = 40; // Spacing between columns
      const startX = 50; // Start position X
      const startY = -100 + offsetY; // Start above screen

      // Spawn enemies for each column
      wave.columns.forEach((column, colIndex) => {
        column.forEach((tile, rowIndex) => {
          if (tile.startsWith('enemy_')) {
            // Parse enemy type from tile
            let enemyType: 'enemy1' | 'enemy2' | 'enemy3' | 'enemy4' | 'enemy5' = 'enemy1';
            if (tile === 'enemy_weak') {
              enemyType = Math.random() < 0.5 ? 'enemy1' : 'enemy2';
            } else if (tile === 'enemy_medium') {
              enemyType = 'enemy2';
            } else if (tile === 'enemy_strong') {
              enemyType = Math.random() < 0.5 ? 'enemy3' : 'enemy4';
            }

            const x = startX + colIndex * columnWidth;
            const y = startY - rowIndex * 50; // Stack enemies vertically

            spawnEnemy({x, y}, enemyType, {x: 0, y: wave.speed * scheduler.scrollSpeed});
          }
        });
      });
    },
  };
});
