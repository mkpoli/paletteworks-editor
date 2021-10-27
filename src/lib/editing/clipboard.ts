import { writable } from 'svelte/store'
import type { Note, Single, Slide } from '$lib/score/beatmap'

export const clipboardSlides = writable<Slide[]>([])
export const clipboardSingles = writable<Single[]>([])
export const clipboardOffsets = writable(new Map<Note, {
  lane: number, tick: number
}>())