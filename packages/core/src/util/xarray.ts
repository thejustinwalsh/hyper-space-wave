/**
 * Arrays ❌ ~~allocations~~
 */

export namespace XArray {
  export class FixedArray<T> {
    private items: T[];
    private readonly _length: number;

    constructor(size: number, initializer: (index: number) => T) {
      this._length = size;
      this.items = Array.from({length: aligned(size)}, initializer);
    }

    get length(): Readonly<number> {
      return this._length;
    }

    get capacity(): Readonly<number> {
      return this.items.length;
    }

    get(index: number): T {
      return this.items[index];
    }

    clear(fn: (item: T, index: number) => T | void): void {
      for (let i = 0; i < this._length; i++) {
        this.items[i] = fn(this.items[i], i) ?? this.items[i];
      }
    }

    [Symbol.iterator](): Iterator<T> {
      return iterator(this.items, this._length);
    }
  }

  export class DynamicArray<T> {
    private items: T[];
    private _length: number;
    private readonly initialCapacity: number;

    constructor(capacity: number = 32) {
      this._length = 0;
      this.initialCapacity = aligned(capacity);
      this.items = new Array();
    }

    get length(): Readonly<number> {
      return this._length;
    }

    get capacity(): Readonly<number> {
      return this.items.length;
    }

    get(index: number): T {
      return this.items[index];
    }

    push(item: T): boolean {
      if (this._length >= this.items.length) {
        // Grow by initial capacity
        this.items.length = this.items.length + this.initialCapacity;
      }
      this.items[this._length++] = item;
      return true;
    }

    clear(): void {
      this._length = 0;
    }

    [Symbol.iterator](): Iterator<T> {
      return iterator(this.items, this._length);
    }
  }
}

const aligned = (size: number) => Math.ceil((size || 32) / 8) * 8;

const iterator = <T>(items: T[], length: number): Iterator<T> => {
  let index = 0;
  return {
    next: (): IteratorResult<T> => {
      if (index < length) {
        return {
          value: items[index++],
          done: false,
        };
      }
      return {
        value: undefined,
        done: true,
      };
    },
  };
};
