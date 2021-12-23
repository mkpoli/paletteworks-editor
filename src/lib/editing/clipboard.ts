import type { Note, Single, Slide } from '$lib/score/beatmap'
import type { Cursor  } from '$lib/position'

import { writable, get } from 'svelte/store'
import { flipped } from '$lib/editing/flip'

export const clipboardSlides = writable<Slide[]>([])
export const clipboardSingles = writable<Single[]>([])
export const clipboardOffsets = writable(new Map<Note, {
  lane: number, tick: number
}>())

function pastedNote(cursor: Cursor) {
  return (note: Note): Note => {
    const offset = get(clipboardOffsets).get(note)
    if (!offset) throw new Error('Unexpected not found clipboardOffset')
    return {
      ...note,
      lane: cursor.lane - offset.lane,
      tick: cursor.tick - offset.tick,
    }
  }
}

export function pasted(cursor: Cursor): { singles: Single[], slides: Slide[] } {
  return {
    singles: get(clipboardSingles).map(pastedNote(cursor)) as Single[],
    slides: get(clipboardSlides).map(slide => ({
      ...slide,
      head: pastedNote(cursor)(slide.head),
      tail: pastedNote(cursor)(slide.tail),
      steps: slide.steps.map(pastedNote(cursor)),
    })) as Slide[],
  }
}

export function flippasted(cursor: Cursor): { singles: Single[], slides: Slide[] } {
  const { singles, slides } = pasted(cursor)
  return flipped(singles, slides)
}