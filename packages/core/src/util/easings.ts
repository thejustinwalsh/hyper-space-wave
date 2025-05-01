/**
 * Collection of easing functions for animation
 * All functions take a parameter from 0 to 1 and return a transformed value from 0 to 1
 * https://easings.net/
 */

const PI = Math.PI;

// Quadratic easing
export const quadIn = (t: number): number => t * t;

export const quadOut = (t: number): number => -(t * (t - 2));

export const quadInOut = (t: number): number => (t < 0.5 ? 2 * t * t : -2 * t * t + 4 * t - 1);

// Cubic easing
export const cubicIn = (t: number): number => t * t * t;

export const cubicOut = (t: number): number => {
  const p = t - 1;
  return p * p * p + 1;
};

export const cubicInOut = (t: number): number => {
  if (t < 0.5) return 4 * t * t * t;
  const p = 2 * t - 2;
  return 0.5 * p * p * p + 1;
};

// Quartic easing
export const quartIn = (t: number): number => t * t * t * t;

export const quartOut = (t: number): number => {
  const p = t - 1;
  return p * p * p * (1 - t) + 1;
};

export const quartInOut = (t: number): number => {
  if (t < 0.5) return 8 * t * t * t * t;
  const p = t - 1;
  return -8 * p * p * p * p + 1;
};

// Quintic easing
export const quintIn = (t: number): number => t * t * t * t * t;

export const quintOut = (t: number): number => {
  const p = t - 1;
  return p * p * p * p * p + 1;
};

export const quintInOut = (t: number): number => {
  if (t < 0.5) return 16 * t * t * t * t * t;
  const p = 2 * t - 2;
  return 0.5 * p * p * p * p * p + 1;
};

// Sinusoidal easing
export const sineIn = (t: number): number => Math.sin((t - 1) * (PI / 2)) + 1;

export const sineOut = (t: number): number => Math.sin(t * (PI / 2));

export const sineInOut = (t: number): number => 0.5 * (1 - Math.cos(t * PI));

// Circular easing
export const circIn = (t: number): number => 1 - Math.sqrt(1 - t * t);

export const circOut = (t: number): number => Math.sqrt((2 - t) * t);

export const circInOut = (t: number): number => {
  if (t < 0.5) return 0.5 * (1 - Math.sqrt(1 - 4 * t * t));
  return 0.5 * (Math.sqrt(-(2 * t - 3) * (2 * t - 1)) + 1);
};

// Exponential easing
export const expoIn = (t: number): number => (t === 0 ? t : Math.pow(2, 10 * (t - 1)));

export const expoOut = (t: number): number => (t === 1 ? t : 1 - Math.pow(2, -10 * t));

export const expoInOut = (t: number): number => {
  if (t === 0 || t === 1) return t;
  if (t < 0.5) return 0.5 * Math.pow(2, 20 * t - 10);
  return -0.5 * Math.pow(2, -20 * t + 10) + 1;
};

// Elastic easing
export const elasticIn = (t: number): number =>
  Math.sin(13 * (PI / 2) * t) * Math.pow(2, 10 * (t - 1));

export const elasticOut = (t: number): number =>
  Math.sin(-13 * (PI / 2) * (t + 1)) * Math.pow(2, -10 * t) + 1;

export const elasticInOut = (t: number): number => {
  if (t < 0.5) {
    return 0.5 * Math.sin(13 * (PI / 2) * (2 * t)) * Math.pow(2, 10 * (2 * t - 1));
  }
  return 0.5 * (Math.sin(-13 * (PI / 2) * (2 * t - 1 + 1)) * Math.pow(2, -10 * (2 * t - 1)) + 2);
};

// Back easing
export const backIn = (t: number): number => t * t * t - t * Math.sin(t * PI);

export const backOut = (t: number): number => {
  const p = 1 - t;
  return 1 - (p * p * p - p * Math.sin(p * PI));
};

export const backInOut = (t: number): number => {
  if (t < 0.5) {
    const p = 2 * t;
    return 0.5 * (p * p * p - p * Math.sin(p * PI));
  }
  const p = 1 - (2 * t - 1);
  return 0.5 * (1 - (p * p * p - p * Math.sin(p * PI))) + 0.5;
};

// Bounce easing
export const bounceOut = (t: number): number => {
  if (t < 4 / 11) return (121 * t * t) / 16;
  if (t < 8 / 11) return (363 / 40) * t * t - (99 / 10) * t + 17 / 5;
  if (t < 9 / 10) return (4356 / 361) * t * t - (35442 / 1805) * t + 16061 / 1805;
  return (54 / 5) * t * t - (513 / 25) * t + 268 / 25;
};

export const bounceIn = (t: number): number => 1 - bounceOut(1 - t);

export const bounceInOut = (t: number): number =>
  t < 0.5 ? 0.5 * bounceIn(t * 2) : 0.5 * bounceOut(t * 2 - 1) + 0.5;

/**
 * Type for easing functions
 */
export type EasingFunction = (t: number) => number;

/**
 * Applies an easing function to a linear interpolation between two values
 * @param a Starting value
 * @param b Ending value
 * @param t Time parameter (0-1)
 * @param easingFn The easing function to use
 * @returns The eased value
 */
export const ease = (a: number, b: number, t: number, easingFn: EasingFunction): number =>
  a + (b - a) * easingFn(t);
