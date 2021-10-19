import { writable } from 'svelte/store'

type Value = string | number | boolean

export type DebugInfo = Map<string, Value>
export const debugInfo = writable(new Map<string, Value>())

export function formatPoint(x: number, y: number) {
  return `(${x?.toFixed(3)}, ${y?.toFixed(3)})`
}

export function dbg(title: string, value: Value) {
  debugInfo.update((map: DebugInfo) => {
    map.set(title, value)
    return map
  })
}