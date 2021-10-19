export function clamp(min: number, number: number, max: number) {
  return Math.min(Math.max(number, min), max);
}

export function gcd(a: number, b: number) {
  if (a < b) return gcd(b, a)
  if (b == 0) return a
  return gcd(b, a % b)
}

export function snap(y: number, step: number) {
  return Math.floor(y / step) * step
}