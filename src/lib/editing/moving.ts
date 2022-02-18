import { writable, get } from 'svelte/store'
import { hasCritical, hasFlick, isSlideHead } from '$lib/score/beatmap'
import type { Note, Single, Slide, INote } from '$lib/score/beatmap'
import { AddRemoveSlides, CombinedMutation, UpdateSingles, UpdateSlides } from '$lib/editing/mutations'
import { combineSlides, getSlideNotes } from '$lib/editing/slides'

export type MoveEvent = CustomEvent<{
  lane: number, tick: number, note: Note
}>

import type { LaneTick } from '$lib/position'

export const moving = writable<boolean>(false)
export const movingNotes = writable<Note[]>([])
export const movingTargets = writable(new Map<Note, LaneTick>())
export const movingOrigins = writable(new Map<Note, LaneTick>())
export const movingOffsets = writable(new Map<Note, LaneTick>())

export function moveNotes(singles: Single[], slides: Slide[]): CombinedMutation | AddRemoveSlides | null {
  const notes = [...get(movingNotes)]
  movingNotes.set([])
  const targets: Map<Note, LaneTick> = new Map(get(movingTargets))

  // -- Check if combining --
  if (notes.length === 1) {
    const note = notes[0]
    const target = {
      ...targets.get(notes[0])!,
      width: notes[0].width,
    }
    let slideA
    let slideB

    if (hasCritical(note) && hasFlick(note)) {
      slideA = slides.find(({ tail }) => tail === note)
      slideB = slides.find(({ head }) => head.tick === target.tick && head.lane === target.lane && head.width === target.width)
    } else if (isSlideHead(note)) {
      slideA = slides.find(({ tail }) => tail.tick === target.tick && tail.lane === target.lane && tail.width === target.width)
      slideB = slides.find(({ head }) => head === note)
    }

    if (slideA && slideB) {
      return combineSlides(slides, slideA, slideB, target)
    }
  }

  // -- Check if anything changes position --
  if ([...targets].every(([note, target]) => note.lane === target.lane && note.tick === target.tick)) {
    return null
  }

  const movingSlides = slides.filter((slide) =>
    getSlideNotes(slide).some((note) => notes.includes(note))
  )

  const slideModifications: Map<Slide, Partial<Slide>> = new Map(
    movingSlides.map((slide) => {
      const { head, tail, steps } = {
        ...slide,
        head: { ...slide.head, ...(targets.get(slide.head) ?? []) },
        tail: { ...slide.tail, ...(targets.get(slide.tail) ?? []) },
        steps: slide.steps.map((step) => ({
          ...step,
          ...(targets.get(step) ?? [])
        })).sort((a, b) => a.tick - b.tick)
      }

      const pickINote = ({ lane, tick, width }: INote) => ({ lane, tick, width })

      return [slide, {
        head: head.tick > tail.tick ? { ...head, ...pickINote(tail) } : head,
        tail: head.tick > tail.tick ? { ...tail, ...pickINote(head) } : tail,
        steps
      }]
    })
  )
  const slideOriginaldatas: Map<Slide, Partial<Slide>> = new Map(
    [...slideModifications].map(([slide]) => [slide, {
      head: slide.head,
      tail: slide.tail,
      steps: slide.steps
    }])
  )

  return new CombinedMutation(singles, slides, [
    new UpdateSingles(singles, new Map([...targets].filter(([note]) => singles.includes(note as Single)) as [Single, Partial<Single>][]), 'move'),
    new UpdateSlides(slides, slideModifications, slideOriginaldatas)
  ], 'note', notes.length, 'move')
}
