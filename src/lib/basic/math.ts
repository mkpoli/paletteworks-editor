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