import { writable } from 'svelte/store'
import type { Note } from '$lib/score/beatmap'

export const moving = writable<boolean>(false)
export const movingNotes = writable<Note[]>([])