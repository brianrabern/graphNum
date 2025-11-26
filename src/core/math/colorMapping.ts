/**
 * Color to Prime mapping based on revelation.tex
 * White/Gray = 1, Red = 2, Blue = 3, Green = 5, Yellow = 7, Cyan = 11, Magenta = 13, ...
 */

export const COLOR_TO_PRIME: Map<string, number> = new Map([
  ['white', 1],
  ['gray', 1],
  ['red', 2],
  ['blue', 3],
  ['green', 5],
  ['yellow', 7],
  ['cyan', 11],
  ['magenta', 13],
]);

export const PRIME_TO_COLOR: Map<number, string> = new Map([
  [1, 'white'],
  [2, 'red'],
  [3, 'blue'],
  [5, 'green'],
  [7, 'yellow'],
  [11, 'cyan'],
  [13, 'magenta'],
]);

// Color name to CSS color value mapping
export const COLOR_VALUES: Map<string, string> = new Map([
  ['white', '#e0e0e0'],
  ['gray', '#e0e0e0'],
  ['red', '#ff4444'],
  ['blue', '#4444ff'],
  ['green', '#44ff44'],
  ['yellow', '#ffff44'],
  ['cyan', '#44ffff'],
  ['magenta', '#ff44ff'],
]);

// Extended color palette for larger primes
const EXTENDED_COLORS = [
  'orange',
  'pink',
  'purple',
  'brown',
  'lime',
  'teal',
  'indigo',
  'violet',
  'coral',
  'salmon',
];

const EXTENDED_COLOR_VALUES = [
  '#ff8844',
  '#ff88ff',
  '#8844ff',
  '#884444',
  '#88ff44',
  '#44ff88',
  '#4444ff',
  '#ff44ff',
  '#ff8844',
  '#ff8888',
];

let nextColorIndex = 0;

/**
 * Get color for a prime number, extending the palette as needed
 */
export function getColorForPrime(prime: number): string {
  if (PRIME_TO_COLOR.has(prime)) {
    return PRIME_TO_COLOR.get(prime)!;
  }

  // Extend the mapping for new primes
  const color = EXTENDED_COLORS[nextColorIndex % EXTENDED_COLORS.length];
  const colorValue = EXTENDED_COLOR_VALUES[nextColorIndex % EXTENDED_COLOR_VALUES.length];
  PRIME_TO_COLOR.set(prime, color);
  COLOR_TO_PRIME.set(color, prime);
  COLOR_VALUES.set(color, colorValue);
  nextColorIndex++;

  return color;
}

/**
 * Get prime for a color
 */
export function getPrimeForColor(color: string): number | undefined {
  return COLOR_TO_PRIME.get(color.toLowerCase());
}

/**
 * Get CSS color value for a color name
 */
export function getColorValue(colorName: string): string {
  return COLOR_VALUES.get(colorName.toLowerCase()) || colorName;
}

/**
 * Get all available colors in order
 */
export function getAvailableColors(): string[] {
  return Array.from(COLOR_TO_PRIME.keys()).filter(c => c !== 'gray'); // gray is same as white
}
