export {}

declare global {
  interface Array<T> {
    pairwise(): [T, T][]
    rotateNext(cur: T): T
    rotatePrev(cur: T): T
  }

  interface Array<T = number> {
    closest(num: number, smaller?: boolean): number | undefined
  }
  
  interface ReadonlyArray<T> {
    pairwise(): [T, T][]
    rotateNext(cur: T): T
    rotatePrev(cur: T): T
  }
}

Array.prototype.pairwise = function pairwise<T>(): [T, T][] {
  return this.slice(1).map((val: T, i: number) => [this[i], val])
}

Array.prototype.rotateNext = function rotateNext<T>(cur: T): T {
  return this[(this.indexOf(cur) + 1) % this.length]
}

Array.prototype.rotatePrev = function rotatePrev<T>(cur: T): T {
  return this[(this.indexOf(cur) - 1 + this.length) % this.length]
}

Array.prototype.closest = function closest(num: number, smaller = true): number | undefined {
  const sorted = [...this].sort((a, b) => a - b)
  return (smaller ? sorted.reverse() : sorted).find(e => (smaller ? e <= num : e >= num))
}