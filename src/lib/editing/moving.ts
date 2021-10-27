import { writable } from 'svelte/store'
import type { Note } from '$lib/score/beatmap'

export type MoveEvent = CustomEvent<{
  lane: number, tick: number, note: Note
}>

export const moving = writable<boolean>(false)
export const movingNotes = writable<Note[]>([])
export const movingOffsets = writable(new Map<Note, {
  lane: number, tick: number
}>())