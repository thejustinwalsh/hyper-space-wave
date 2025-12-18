/**
 * Wave Pattern Generator using WFC
 * Generates enemy wave patterns with guaranteed safe paths and difficulty scaling
 */

import {WFC, WFCTile, WFCConstraint} from './wfc';

// Tile types for wave generation
export type WaveTileType =
  | 'empty' // Safe space
  | 'enemy_weak' // Easy enemy (enemy1)
  | 'enemy_medium' // Medium enemy (enemy2)
  | 'enemy_strong' // Strong enemy (enemy3/4)
  | 'hazard_zone' // Space where comets can spawn
  | 'boundary'; // Edge of the playfield

// Enemy type mapping
export type EnemyType = 'enemy1' | 'enemy2' | 'enemy3' | 'enemy4' | 'enemy5';

export interface WavePattern {
  id: number;
  columns: WaveTileType[][]; // [column][row]
  speed: number;
  drops: number;
  difficulty: number;
}

export interface DifficultySettings {
  level: number; // 1-10
  enemyDensity: number; // 0-1, how many enemies vs empty spaces
  pathWidth: number; // 1-3, minimum safe path width
  strongEnemyChance: number; // 0-1, chance of strong enemies
  hazardChance: number; // 0-1, chance of hazard zones
  speed: number; // Base speed multiplier
}

/**
 * Get default difficulty settings for a given level
 */
export function getDifficultySettings(level: number): DifficultySettings {
  const normalizedLevel = Math.max(1, Math.min(10, level));

  return {
    level: normalizedLevel,
    enemyDensity: 0.3 + normalizedLevel * 0.05, // 0.35 to 0.8
    pathWidth: Math.max(1, 3 - Math.floor(normalizedLevel / 4)), // 3 at level 1, 2 at level 4, 1 at level 8
    strongEnemyChance: normalizedLevel * 0.08, // 0.08 to 0.8
    hazardChance: normalizedLevel * 0.05, // 0.05 to 0.5
    speed: 1 + normalizedLevel * 0.3, // 1.3 to 4.0
  };
}

/**
 * Define WFC tiles with weights based on difficulty
 */
function createWaveTiles(difficulty: DifficultySettings): WFCTile<WaveTileType>[] {
  const emptyWeight = 100 - difficulty.enemyDensity * 100;
  const weakWeight = 50 * (1 - difficulty.strongEnemyChance);
  const mediumWeight = 30;
  const strongWeight = 20 * difficulty.strongEnemyChance;
  const hazardWeight = difficulty.hazardChance * 30;

  return [
    {id: 'empty', weight: emptyWeight},
    {id: 'enemy_weak', weight: weakWeight},
    {id: 'enemy_medium', weight: mediumWeight},
    {id: 'enemy_strong', weight: strongWeight},
    {id: 'hazard_zone', weight: hazardWeight},
    {id: 'boundary', weight: 0}, // Never randomly selected
  ];
}

/**
 * Define WFC constraints for wave generation
 * These ensure valid patterns and prevent tough enemies stacking
 */
function createWaveConstraints(): WFCConstraint<WaveTileType>[] {
  const all = new Set<WaveTileType>([
    'empty',
    'enemy_weak',
    'enemy_medium',
    'enemy_strong',
    'hazard_zone',
  ]);
  const notStrong = new Set<WaveTileType>(['empty', 'enemy_weak', 'enemy_medium', 'hazard_zone']);
  const safeish = new Set<WaveTileType>(['empty', 'enemy_weak', 'hazard_zone']);

  return [
    {
      tile: 'empty',
      up: all, // Empty can be above anything
      down: all, // Empty can be below anything
      left: all,
      right: all,
    },
    {
      tile: 'enemy_weak',
      up: all,
      down: all,
      left: all,
      right: all,
    },
    {
      tile: 'enemy_medium',
      up: all,
      down: notStrong, // Medium enemies can't be directly above strong ones (prevents stacking)
      left: all,
      right: all,
    },
    {
      tile: 'enemy_strong',
      up: safeish, // Strong enemies can only be above safer tiles
      down: notStrong, // Strong enemies can't be above other strong/medium (prevents vertical stacking)
      left: all,
      right: all,
    },
    {
      tile: 'hazard_zone',
      up: all,
      down: all,
      left: all,
      right: all,
    },
    {
      tile: 'boundary',
      up: new Set(['boundary']),
      down: new Set(['boundary']),
      left: new Set(['boundary']),
      right: new Set(['boundary']),
    },
  ];
}

/**
 * Generate a single wave pattern
 */
export function generateWavePattern(
  id: number,
  difficulty: DifficultySettings,
  columns = 6,
  rows = 8,
  seed?: number,
): WavePattern | null {
  const tiles = createWaveTiles(difficulty);
  const constraints = createWaveConstraints();

  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    attempts++;

    const wfc = new WFC({
      tiles,
      constraints,
      width: columns,
      height: rows,
      seed: seed !== undefined ? seed + attempts : undefined,
    });

    const result = wfc.generate();
    if (!result) continue;

    // Convert rows to columns
    const columnData: WaveTileType[][] = Array.from({length: columns}, (_, x) =>
      Array.from({length: rows}, (_, y) => result[y][x]),
    );

    // Ensure there's at least one safe path through the wave
    if (!ensureSafePath(columnData, difficulty.pathWidth)) {
      continue;
    }

    // Calculate drops based on enemy count
    const enemyCount = columnData.flat().filter(t => t.startsWith('enemy_')).length;
    const drops = Math.floor(enemyCount * 0.3); // 30% of enemies drop loot

    return {
      id,
      columns: columnData,
      speed: difficulty.speed,
      drops,
      difficulty: difficulty.level,
    };
  }

  return null;
}

/**
 * Ensure there's a safe path through the wave
 * Modifies the column data in place
 */
function ensureSafePath(columns: WaveTileType[][], minWidth: number): boolean {
  const numColumns = columns.length;
  const numRows = columns[0]?.length || 0;

  if (numColumns === 0 || numRows === 0) return false;

  // Find or create a path from top to bottom
  let currentColumn = Math.floor(numColumns / 2); // Start in the middle

  for (let row = 0; row < numRows; row++) {
    // Make current position and adjacent positions safe
    for (let offset = -(minWidth - 1); offset < minWidth; offset++) {
      const col = currentColumn + offset;
      if (col >= 0 && col < numColumns) {
        // Only clear enemies, keep hazard zones
        if (columns[col][row].startsWith('enemy_')) {
          columns[col][row] = 'empty';
        }
      }
    }

    // Randomly move path left or right for next row
    const direction = Math.random() < 0.5 ? -1 : 1;
    const newColumn = currentColumn + direction;

    if (newColumn >= minWidth - 1 && newColumn < numColumns - (minWidth - 1)) {
      currentColumn = newColumn;
    }
  }

  return true;
}

/**
 * Convert wave tile to enemy type for spawning
 */
export function tileToEnemyType(tile: WaveTileType): EnemyType | null {
  switch (tile) {
    case 'enemy_weak':
      return Math.random() < 0.5 ? 'enemy1' : 'enemy2';
    case 'enemy_medium':
      return 'enemy2';
    case 'enemy_strong':
      return Math.random() < 0.5 ? 'enemy3' : 'enemy4';
    default:
      return null;
  }
}

/**
 * Generate a sequence of wave patterns for a level
 */
export function generateWaveSequence(
  startDifficulty: number,
  count: number,
  seed?: number,
): WavePattern[] {
  const patterns: WavePattern[] = [];

  for (let i = 0; i < count; i++) {
    // Gradually increase difficulty
    const difficultyLevel = startDifficulty + Math.floor(i / 5);
    const difficulty = getDifficultySettings(difficultyLevel);

    const pattern = generateWavePattern(i, difficulty, 6, 8, seed ? seed + i : undefined);

    if (pattern) {
      patterns.push(pattern);
    } else {
      // Fallback to simpler pattern if generation fails
      console.warn(`Failed to generate wave pattern ${i}, using fallback`);
      patterns.push(createFallbackPattern(i, difficulty));
    }
  }

  return patterns;
}

/**
 * Create a simple fallback pattern when WFC fails
 */
function createFallbackPattern(id: number, difficulty: DifficultySettings): WavePattern {
  const columns: WaveTileType[][] = Array.from({length: 6}, (_, col) =>
    Array.from({length: 8}, (_, row) => {
      // Create a simple alternating pattern with a safe path in the middle
      if (col === 2 || col === 3) return 'empty'; // Middle columns are safe

      if (row % 2 === 0) {
        return Math.random() < difficulty.enemyDensity ? 'enemy_weak' : 'empty';
      } else {
        return 'empty';
      }
    }),
  );

  return {
    id,
    columns,
    speed: difficulty.speed,
    drops: 3,
    difficulty: difficulty.level,
  };
}

/**
 * Convert wave pattern to database format
 */
export function wavePatternToDBFormat(pattern: WavePattern) {
  const enemies: (EnemyType | null)[] = pattern.columns.flatMap(column =>
    column.map(tileToEnemyType),
  );

  return {
    id: pattern.id,
    pattern: pattern.columns
      .map(col => col.map(t => (t.startsWith('enemy_') ? 'X' : ' ')).join(''))
      .join('|'),
    speed: pattern.speed.toFixed(2),
    drops: pattern.drops,
    enemies: enemies.filter((e): e is EnemyType => e !== null),
    difficulty: pattern.difficulty,
  };
}
