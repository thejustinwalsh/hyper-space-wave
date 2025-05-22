import type {FixedLengthArray} from '../types';
import type {PointData} from 'pixi.js';

/**
 * Math Library ❌ ~~allocations~~
 */

/**
 * Maps a number from one range to another
 * @param num The number to map
 * @param inMin The minimum value of the input range
 * @param inMax The maximum value of the input range
 * @param outMin The minimum value of the output range
 * @param outMax The maximum value of the output range
 * @returns The mapped number
 */
export const map = (num: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
  ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

/**
 * Fits a rectangle to a maximum size while maintaining its aspect ratio
 * @param w The width of the rectangle
 * @param h The height of the rectangle
 * @param maxW The maximum width of the rectangle
 * @param maxH The maximum height of the rectangle
 * @returns The scaled rectangle
 */
export const fit = (w: number, h: number, maxW: number, maxH: number) => {
  const scale = Math.min(maxW / w, maxH / h);
  return {width: w * scale, height: h * scale};
};

/**
 * Adds two points together and stores the result in out
 * @param a The first point
 * @param b The second point
 * @param out Optional output point. If not provided, a new point will be created
 * @returns The output point
 */
export const add = (a: PointData, b: PointData, out: PointData = {x: 0, y: 0}): PointData => {
  out.x = a.x + b.x;
  out.y = a.y + b.y;
  return out;
};

/**
 * Subtracts point b from point a and stores the result in out
 * @param a The first point
 * @param b The second point
 * @param out Optional output point. If not provided, a new point will be created
 * @returns The output point
 */
export const sub = (a: PointData, b: PointData, out: PointData = {x: 0, y: 0}): PointData => {
  out.x = a.x - b.x;
  out.y = a.y - b.y;
  return out;
};

/**
 * Inverts a point's coordinates and stores the result in out
 * @param a The point to invert
 * @param out Optional output point. If not provided, a new point will be created
 * @returns The output point
 */
export const invert = (a: PointData, out: PointData = {x: 0, y: 0}): PointData => {
  out.x = -a.x;
  out.y = -a.y;
  return out;
};

/**
 * Multiplies a point's coordinates by a scalar value and stores the result in out
 * @param a The point to multiply
 * @param scalar The scalar value
 * @param out Optional output point. If not provided, a new point will be created
 * @returns The output point
 */
export const multiplyScalar = (
  a: PointData,
  scalar: number,
  out: PointData = {x: 0, y: 0},
): PointData => {
  out.x = a.x * scalar;
  out.y = a.y * scalar;
  return out;
};

/**
 * Divides a point's coordinates by a scalar value and stores the result in out
 * @param a The point to divide
 * @param scalar The scalar value
 * @param out Optional output point. If not provided, a new point will be created
 * @returns The output point
 */
export const divideScalar = (
  a: PointData,
  scalar: number,
  out: PointData = {x: 0, y: 0},
): PointData => {
  if (scalar === 0) {
    out.x = 0;
    out.y = 0;
  } else {
    const invScalar = 1 / scalar;
    out.x = a.x * invScalar;
    out.y = a.y * invScalar;
  }
  return out;
};

/**
 * Calculates the dot product of two points
 * @param a The first point
 * @param b The second point
 * @returns The dot product
 */
export const dot = (a: PointData, b: PointData): number => a.x * b.x + a.y * b.y;

/**
 * Calculates the length of a point vector
 * @param a The point
 * @returns The length
 */
export const length = (a: PointData): number => Math.sqrt(a.x * a.x + a.y * a.y);

/**
 * Calculates the squared length of a point vector
 * @param a The point
 * @returns The squared length
 */
export const lengthSq = (a: PointData): number => a.x * a.x + a.y * a.y;

/**
 * Normalizes a point vector and stores the result in out
 * @param a The point to normalize
 * @param out Optional output point. If not provided, a new point will be created
 * @returns The output point
 */
export const normalize = (a: PointData, out: PointData = {x: 0, y: 0}): PointData => {
  const len = length(a);
  return len > 0 ? divideScalar(a, len, out) : out;
};

/**
 * Calculates the distance between two points
 * @param a The first point
 * @param b The second point
 * @returns The distance
 */
export const distanceTo = (a: PointData, b: PointData): number => Math.sqrt(distanceToSq(a, b));

/**
 * Calculates the squared distance between two points
 * @param a The first point
 * @param b The second point
 * @returns The squared distance
 */
export const distanceToSq = (a: PointData, b: PointData): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

/**
 * Linearly interpolates between two points and stores the result in out
 * Use with easing functions like easingFn(t) to create smooth animations
 * `lerp(a, b, easingFn(t))`
 * @param a The first point
 * @param b The second point
 * @param alpha The interpolation value (0-1)
 * @param out Optional output point. If not provided, a new point will be created
 * @returns The output point
 */
export const lerp = (
  a: PointData,
  b: PointData,
  alpha: number,
  out: PointData = {x: 0, y: 0},
): PointData => {
  out.x = a.x + (b.x - a.x) * alpha;
  out.y = a.y + (b.y - a.y) * alpha;
  return out;
};

/**
 * Converts degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
export const rad = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * Converts radians to degrees
 * @param radians Angle in radians
 * @returns Angle in degrees
 */
export const deg = (radians: number): number => (radians * 180) / Math.PI;

/**
 * Calculates the angle in radians of a point vector
 * @param a The point
 * @returns The angle in radians
 */
export const toRad = (a: PointData): number => Math.atan2(a.x, a.y);

/**
 * Calculates the angle in degrees of a point vector
 * @param a The point
 * @returns The angle in degrees
 */
export const toDeg = (a: PointData): number => (toRad(a) * 180) / Math.PI;

/**
 * Default epsilon value for floating point comparisons.
 * Uses 1e-5 as it's a practical value for 2D graphics:
 * - Represents 1/100000th precision which is sufficient for pixel-level accuracy
 * - More forgiving for accumulated floating-point errors in transformations
 * - Sub-pixel precision beyond 1/10000th is rarely meaningful in 2D graphics
 */
export const EPSILON = 1e-5;

/**
 * Checks if two numbers are approximately equal within a given epsilon
 * @param a First number
 * @param b Second number
 * @param epsilon Optional maximum allowed difference (defaults to EPSILON)
 * @returns True if the numbers are approximately equal
 */
export const nearEqual = (a: number, b: number, epsilon: number = EPSILON): boolean =>
  Math.abs(a - b) <= epsilon;

/**
 * Checks if two points are approximately equal within a given epsilon tolerance
 * @param a The first point
 * @param b The second point
 * @param epsilon Optional maximum allowed difference between coordinates (defaults to EPSILON)
 * @returns True if the points are approximately equal
 */
export const equals = (a: PointData, b: PointData, epsilon = EPSILON): boolean =>
  distanceToSq(a, b) <= epsilon * epsilon;

/**
 * Rotates a point by an angle in radians and stores the result in out
 * @param a The point to rotate
 * @param theta The angle in radians
 * @param out Optional output point. If not provided, a new point will be created
 * @returns The output point
 */
export const rotate = (a: PointData, theta: number, out: PointData = {x: 0, y: 0}): PointData => {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  out.x = a.x * cos - a.y * sin;
  out.y = a.x * sin + a.y * cos;
  return out;
};

/**
 * Creates an array of points with a fixed length
 * Utility to create pools of points to pass into out params and avoid allocations
 * @param count The number of points to create
 * @returns An array of points
 */
export const points = <N extends number>(count: N) => {
  const points = Array.from({length: count}, () => ({x: 0, y: 0}));
  return points as FixedLengthArray<PointData, N>;
};
