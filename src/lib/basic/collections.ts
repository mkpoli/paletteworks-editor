export function rotateNext<T>(cur: T, arr: Readonly<Array<T>>) {
  return arr[(arr.indexOf(cur) + 1) % arr.length]
}

export function closest(arr: Array<number>, num: number, smaller = false): number | undefined {
  let result: number | undefined
  arr.some((val) => {
    if (smaller && val > num) {
      return true   
    } else if (!smaller && val < num) {
      return true
    }
    result = val
  })
  return result
}

export function max(arr: Array<number>) {
  if (!arr.length) {
    return undefined
  }
  return Math.max(...arr)
}

declare global {
  interface Array<T> {
    pairwise(): [T, T][]
  }
}

Array.prototype.pairwise = function pairwise<T>(): [T, T][] {
  return this.slice(1).map((val: T, i: number) => [this[i], val])
}
