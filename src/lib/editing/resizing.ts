import type { Note } from '$lib/score/beatmap'

import { writable } from 'svelte/store'
import { minmax } from '$lib/basic/math'

export const resizing = writable<boolean>(false)
export const resizingNotes = writable<Note[]>([])
export const resizingOffsets = writable(new Map<Note, { reference: number, offset: number, mutating: number }>())

export function calcResized(a: number, b: number): [number, number] {
  const [left, right] = minmax(a, b)
  return [left, right - left]
}