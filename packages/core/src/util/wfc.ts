/**
 * Wave Function Collapse (WFC) Algorithm
 * Generates patterns by collapsing superpositions based on constraints
 */

export interface WFCTile<T = string> {
  id: T;
  weight: number; // Higher weight = more likely to be selected
}

export interface WFCConstraint<T = string> {
  tile: T;
  // Which tiles can appear in each direction
  up?: Set<T>;
  down?: Set<T>;
  left?: Set<T>;
  right?: Set<T>;
}

export interface WFCOptions<T = string> {
  tiles: WFCTile<T>[];
  constraints: WFCConstraint<T>[];
  width: number;
  height: number;
  seed?: number;
}

interface Cell<T> {
  collapsed: boolean;
  options: Set<T>;
  entropy: number;
}

export class WFC<T = string> {
  private grid: Cell<T>[][];
  private tiles: Map<T, WFCTile<T>>;
  private constraints: Map<T, WFCConstraint<T>>;
  private width: number;
  private height: number;
  private rng: () => number;

  constructor(options: WFCOptions<T>) {
    this.width = options.width;
    this.height = options.height;
    this.tiles = new Map(options.tiles.map(t => [t.id, t]));
    this.constraints = new Map(options.constraints.map(c => [c.tile, c]));

    // Simple seeded RNG (mulberry32)
    if (options.seed !== undefined) {
      let seed = options.seed;
      this.rng = () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    } else {
      this.rng = Math.random;
    }

    // Initialize grid with all possibilities
    this.grid = Array.from({length: this.height}, () =>
      Array.from({length: this.width}, () => ({
        collapsed: false,
        options: new Set(this.tiles.keys()),
        entropy: this.tiles.size,
      })),
    );
  }

  /**
   * Run the WFC algorithm to generate a pattern
   */
  generate(): T[][] | null {
    let iterations = 0;
    const maxIterations = this.width * this.height * 10;

    while (iterations < maxIterations) {
      iterations++;

      // Find cell with lowest non-zero entropy
      const cell = this.findLowestEntropyCell();
      if (!cell) {
        // All cells collapsed successfully
        return this.grid.map(row => row.map(c => Array.from(c.options)[0]));
      }

      // Collapse the cell
      const {x, y} = cell;
      this.collapseCell(x, y);

      // Propagate constraints
      if (!this.propagate(x, y)) {
        // Contradiction detected, generation failed
        return null;
      }
    }

    // Max iterations reached without completing
    return null;
  }

  /**
   * Find the cell with the lowest non-zero entropy
   */
  private findLowestEntropyCell(): {x: number; y: number} | null {
    let minEntropy = Infinity;
    const candidates: {x: number; y: number}[] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        if (!cell.collapsed && cell.entropy > 0) {
          if (cell.entropy < minEntropy) {
            minEntropy = cell.entropy;
            candidates.length = 0;
            candidates.push({x, y});
          } else if (cell.entropy === minEntropy) {
            candidates.push({x, y});
          }
        }
      }
    }

    if (candidates.length === 0) return null;

    // Randomly select one of the lowest entropy cells
    return candidates[Math.floor(this.rng() * candidates.length)];
  }

  /**
   * Collapse a cell to a single tile based on weighted probabilities
   */
  private collapseCell(x: number, y: number): void {
    const cell = this.grid[y][x];
    if (cell.collapsed) return;

    // Calculate weighted random selection
    const options = Array.from(cell.options);
    const weights = options.map(id => this.tiles.get(id)!.weight);
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    let random = this.rng() * totalWeight;
    let selectedTile: T = options[0];

    for (let i = 0; i < options.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        selectedTile = options[i];
        break;
      }
    }

    // Collapse to selected tile
    cell.options = new Set([selectedTile]);
    cell.collapsed = true;
    cell.entropy = 0;
  }

  /**
   * Propagate constraints from a cell to its neighbors
   */
  private propagate(startX: number, startY: number): boolean {
    const stack: {x: number; y: number}[] = [{x: startX, y: startY}];
    const visited = new Set<string>();

    while (stack.length > 0) {
      const {x, y} = stack.pop()!;
      const key = `${x},${y}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const cell = this.grid[y][x];
      if (!cell.collapsed) continue;

      const tileId = Array.from(cell.options)[0];
      const constraint = this.constraints.get(tileId);
      if (!constraint) continue;

      // Check all four directions
      const directions = [
        {dx: 0, dy: -1, allowed: constraint.up, inverse: 'down'},
        {dx: 0, dy: 1, allowed: constraint.down, inverse: 'up'},
        {dx: -1, dy: 0, allowed: constraint.left, inverse: 'right'},
        {dx: 1, dy: 0, allowed: constraint.right, inverse: 'left'},
      ] as const;

      for (const {dx, dy, allowed} of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (nx < 0 || nx >= this.width || ny < 0 || ny >= this.height) continue;

        const neighbor = this.grid[ny][nx];
        if (neighbor.collapsed) continue;

        // Remove options that aren't allowed by the constraint
        if (allowed) {
          const sizeBefore = neighbor.options.size;
          neighbor.options = new Set(Array.from(neighbor.options).filter(id => allowed.has(id)));

          if (neighbor.options.size === 0) {
            // Contradiction!
            return false;
          }

          if (neighbor.options.size !== sizeBefore) {
            neighbor.entropy = neighbor.options.size;
            stack.push({x: nx, y: ny});
          }
        }
      }
    }

    return true;
  }

  /**
   * Get the current state of the grid (for debugging)
   */
  getGrid(): Cell<T>[][] {
    return this.grid;
  }

  /**
   * Manually set a cell (useful for forcing certain patterns)
   */
  setCell(x: number, y: number, tile: T): boolean {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;

    const cell = this.grid[y][x];
    cell.options = new Set([tile]);
    cell.collapsed = true;
    cell.entropy = 0;

    return this.propagate(x, y);
  }
}
