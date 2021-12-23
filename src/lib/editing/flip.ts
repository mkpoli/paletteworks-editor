import type { Note, Single, Slide } from "$lib/score/beatmap"

import { LANE_MAX } from "$lib/consts"
import { flipFlick } from "$lib/editing/flick"
import { BatchUpdate } from "$lib/editing/mutations"

export function flippedNote(note: Note): Note {
  return {
    ...note,
    ...('flick' in note ? { flick: flipFlick(note.flick) } : {}),
    lane: LANE_MAX + 1 - note.lane,
  }
}

export function flipped(singles: Single[], slides: Slide[]): { singles: Single[], slides: Slide[] } {
  return {
    singles: singles.map(flippedNote) as Single[],
    slides: slides.map(slide => ({
      ...slide,
      head: flippedNote(slide.head),
      tail: flippedNote(slide.tail),
      steps: slide.steps.map(flippedNote),
    })) as Slide[],
  }
}

export function flipNotes(singles: Single[], slides: Slide[], notes: Note[]): BatchUpdate {
  const pickLaneFlick = (note: Note) => ({
    lane: note.lane,
    ...('flick' in note ? { flick: note.flick } : {})
  })
  const flipTargets = new Map(notes.map((note) => 
    [note, pickLaneFlick(flippedNote(note))]
  ))
  const flipOrigins = new Map(notes.map((note) =>
    [note, pickLaneFlick(note)]
  ))
  return new BatchUpdate(singles, slides, flipTargets, flipOrigins, 'flip')
}