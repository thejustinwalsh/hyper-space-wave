/**
 * Arrays ❌ ~~allocations~~
 */

export namespace XArray {
  /**
   * A fixed-size array that does not grow or shrink.
   * It is useful for scenarios where the number of items is known in advance and remains constant.
   */
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
      return iterator(this);
    }
  }

  /**
   * A dynamic array that grows in size when needed.
   * It is useful for scenarios where the number of items is not known in advance.
   */
  export class DynamicArray<T> {
    private items: T[];
    private _length: number;
    private readonly _capacity: number;

    constructor(capacity: number = 32) {
      this._length = 0;
      this._capacity = aligned(capacity);
      this.items = Array.from({length: this._capacity});
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

    push(item: T): void {
      if (this._length >= this.items.length) {
        this.items.length = this.items.length + this._capacity;
      }
      this.items[this._length++] = item;
    }

    clear(): void {
      this._length = 0;
    }

    [Symbol.iterator](): Iterator<T> {
      return iterator(this);
    }
  }

  /**
   * A ring buffer (circular array) that overwrites the oldest item when full.
   * It is useful for scenarios where you want to maintain a fixed-size history of items.
   */
  export class CircularArray<T> {
    private items: T[];
    private _length: number;
    private readonly _capacity: number;
    private head: number;
    private tail: number;

    constructor(size: number) {
      this._length = 0;
      this._capacity = size;
      this.items = Array.from({length: aligned(size)});
      this.head = 0;
      this.tail = 0;
    }

    get length(): Readonly<number> {
      return this._length;
    }

    get(index: number): T {
      return this.items[(this.head + index) % this._capacity];
    }

    push(item: T): void {
      this.items[this.tail] = item;
      if (this._length < this._capacity) {
        this._length++;
      } else {
        // If full, overwrite the oldest item
        this.head = (this.head + 1) % this._capacity;
      }
      this.tail = (this.tail + 1) % this._capacity;
      this.items[this.tail] = item;
    }

    clear(fn?: (item: T, index: number) => T | void): void {
      for (let i = 0; i < this._length; i++) {
        if (fn) {
          const idx = (this.head + i) % this._length;
          this.items[idx] = fn(this.items[idx], i) ?? this.items[idx];
        }
      }
      this.head = 0;
      this.tail = 0;
    }

    [Symbol.iterator](): Iterator<T> {
      return iterator(this);
    }
  }
}

const aligned = (size: number) => Math.ceil((size || 32) / 8) * 8;

const iterator = <T>(source: {get(index: number): T; length: number}): Iterator<T> => {
  let index = 0;
  return {
    next(): IteratorResult<T> {
      if (index < source.length) {
        return {value: source.get(index++), done: false};
      }
      return {value: undefined, done: true};
    },
  };
};
