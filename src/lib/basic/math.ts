export function clamp(min: number, number: number, max: number): number {
  return Math.min(Math.max(number, min), max);
}

export function gcd(a: number, b: number): number {
  if (a < b) return gcd(b, a)
  if (b == 0) return a
  return gcd(b, a % b)
}

export function snap(y: number, step: number): number {
  return Math.floor(y / step) * step
}

export function minmax(a: number, b: number): [number, number] {
  return [Math.min(a, b), Math.max(a, b)]
}

export function between(a: number, x: number, b: number, includeMin = true, includeMax = true): boolean {
  const [min, max] = minmax(a, b)
  return (includeMin ? x >= min : x > min) && (includeMax ? x <= max : x < max)
}

// from: https://stackoverflow.com/a/59906630/2719898
type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift'
type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> =
  Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>>
  & {
    readonly length: L 
    [ I : number ] : T
    [Symbol.iterator]: () => IterableIterator<T>   
  }

/**
 * Calculate the average of multiple vectors with the same dimension
 * @param values an array of vectors
 * @returns average of all vectors
 */
export function average<T extends number>(values: FixedLengthArray<number, T>[]): number[] {
  const total = values.reduce((acc, v) => acc.map((a, i) => a + v[i]), values[0].map(() => 0))
  return total.map(v => v / values.length)
}

export function lerp(x: number, y: number, a: number):number {
  return x * (1 - a) + y * a
}

export function easeInQuad(x: number): number {
  return x * x
}

export function easeOutQuad(x: number): number {
  return 1 - (1 - x) * (1 - x)
}