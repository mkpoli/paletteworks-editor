export function rotateNext<T>(cur: T, arr: Array<T>) {
  return arr[(arr.indexOf(cur) + 1) % arr.length]
}
