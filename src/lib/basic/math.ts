export function clamp(min:number, number:number, max:number) {
  return Math.min(Math.max(number, min), max);
}
