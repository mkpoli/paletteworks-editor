export function rotateNext<T>(cur: T, arr: Array<T>) {
  return arr[(arr.indexOf(cur) + 1) % arr.length]
}

export function closest(arr: Array<number>, num: number, smaller: boolean=false): number {
  let result: number
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
