import {ConfigurableTrait, Entity, ExtractSchema} from 'koota';
import {Position, Extent} from '../state/traits';
import {XArray} from './xarray';

export type SpatialHashItem = {entity: Entity; cell: number; group: ConfigurableTrait};
export type SpatialHashCell = Map<Entity, SpatialHashItem>;

export interface SpatialHashConfig {
  cellSize: number;
  width: number;
  height: number;
  x?: number;
  y?: number;
}

export class SpatialHash {
  private config: SpatialHashConfig & {x: number; y: number; cols: number; rows: number};

  private cells: XArray.FixedArray<SpatialHashCell>;
  private cols: number;
  private rows: number;

  constructor(config: SpatialHashConfig = {cellSize: 0, width: 0, height: 0, x: 0, y: 0}) {
    this.cols = Math.ceil(config.width / config.cellSize);
    this.rows = Math.ceil(config.height / config.cellSize);
    this.config = {
      ...config,
      x: config.x ?? 0,
      y: config.y ?? 0,
      cols: this.cols,
      rows: this.rows,
    };
    this.cells = new XArray.FixedArray<SpatialHashCell>(
      this.cols * this.rows,
      () => new Map<Entity, SpatialHashItem>(),
    );
  }

  getConfig() {
    return Object.freeze({...this.config});
  }

  clear(): void {
    this.cells.clear(cell => cell.clear());
  }

  getCellIndex(col: number, row: number): number {
    return row * this.cols + col;
  }

  getCellCoords(index: number): [number, number] {
    return [index % this.cols, Math.floor(index / this.cols)];
  }

  mapCellCoords(x: number, y: number): [number, number] {
    return [
      Math.floor((x - this.config.x) / this.config.cellSize),
      Math.floor((y - this.config.y) / this.config.cellSize),
    ];
  }

  getCellsForBounds(
    position: ExtractSchema<typeof Position>,
    extent: ExtractSchema<typeof Extent>,
  ): number[] {
    const [minCol, minRow] = this.mapCellCoords(position.x + extent.x, position.y + extent.y);
    const [maxCol, maxRow] = this.mapCellCoords(
      position.x + extent.x + extent.width,
      position.y + extent.y + extent.height,
    );

    const indices: number[] = [];
    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
          indices.push(this.getCellIndex(col, row));
        }
      }
    }

    return indices;
  }

  insert(
    entity: Entity,
    group: ConfigurableTrait,
    position: ExtractSchema<typeof Position>,
    extent: ExtractSchema<typeof Extent>,
  ): boolean {
    const indices = this.getCellsForBounds(position, extent);
    indices.forEach(index => {
      this.cells.get(index).set(entity, {entity, cell: index, group});
    });
    return indices.length > 0;
  }

  query(
    position: ExtractSchema<typeof Position>,
    extent: ExtractSchema<typeof Extent>,
  ): Iterable<{entity: Entity; cell: number; group: ConfigurableTrait}> & {length: number} {
    const results: SpatialHashItem[] = [];
    this.getCellsForBounds(position, extent).forEach(index => {
      for (const [_, item] of this.cells.get(index)) {
        results.push(item);
      }
    });
    return results;
  }

  remove(
    entity: Entity,
    position: ExtractSchema<typeof Position>,
    extent: ExtractSchema<typeof Extent>,
  ): void {
    this.getCellsForBounds(position, extent).forEach(index => {
      this.cells.get(index).delete(entity);
    });
  }
}
