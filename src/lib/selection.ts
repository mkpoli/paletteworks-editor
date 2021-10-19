import { writable } from 'svelte/store'
import type { Note } from '$lib/score/beatmap'

export const selectedNotes = writable<Note[]>([])
