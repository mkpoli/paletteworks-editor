import { writable } from 'svelte/store'
import type { Note } from '$lib/score/beatmap'

export const resizing = writable<boolean>(false)
export const resizingNotes = writable<Note[]>([])
export const resizingOffsets = writable(new Map<Note, { reference: number, offset: number }>())