import type { Note } from '$lib/score/beatmap'

import { writable } from 'svelte/store'
import { clamp, minmax } from '$lib/basic/math'
import { WIDTH_DEFAULT } from '$lib/consts'

export const resizing = writable<boolean>(false)
export const resizingNotes = writable<Note[]>([])
export const resizingOriginNote = writable<Note>()
export const resizingTargets = writable(
  new Map<Note, { lane: number; width: number }>()
)
export const resizingOrigins = writable(
  new Map<Note, { lane: number; width: number }>()
)
export const resizingOffsets = writable(
  new Map<Note, { reference: number; offset: number; mutating: number }>()
)
export const resizingLastWidth = writable<number>(WIDTH_DEFAULT)

export function calcResized(a: number, b: number): [number, number] {
  const [left, right] = minmax(a, b)
  const width = right - left
  return [left, clamp(1, width, 12)]
}
