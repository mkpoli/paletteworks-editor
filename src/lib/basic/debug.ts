import { writable } from 'svelte/store'

export type DebugInfo = Map<string, string | number>
export const debugInfo = writable(new Map<string, string | number>())

export function formatPoint(x: number, y: number) {
  return `(${x?.toFixed(3)}, ${y?.toFixed(3)})`
}

export function dbg(title: string, value: string | number) {
  debugInfo.update((map: DebugInfo) => {
    map.set(title, value)
    return map
  })
}