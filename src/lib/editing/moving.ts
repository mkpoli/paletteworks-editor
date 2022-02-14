import { writable, get } from 'svelte/store'
import { hasCritical, hasFlick, isSlideHead } from '$lib/score/beatmap'
import type { Note, Single, Slide } from '$lib/score/beatmap'
import { AddRemoveSlides, BatchUpdate } from '$lib/editing/mutations'
import { combineSlides } from '$lib/editing/slides'

export type MoveEvent = CustomEvent<{
  lane: number, tick: number, note: Note
}>

export const moving = writable<boolean>(false)
export const movingNotes = writable<Note[]>([])
export const movingTargets = writable(new Map<Note, {
  lane: number, tick: number
}>())
export const movingOrigins = writable(new Map<Note, {
  lane: number, tick: number
}>())
export const movingOffsets = writable(new Map<Note, {
  lane: number, tick: number
}>())

export function moveNotes(singles: Single[], slides: Slide[]): BatchUpdate | AddRemoveSlides {
  const notes = get(movingNotes)
  const targets = new Map(get(movingTargets))
  const origins = new Map(get(movingOrigins))
  movingNotes.set([])

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

  // Check if steps reversed
  const movingSlides = slides.filter(({ steps }) => steps.some((step) => notes.includes(step)))
  movingSlides.forEach(({ steps }) => {
    const switched = steps
      .map((step, index) => [index, { ...step, ...(targets.get(step) ?? {}) }] as [number, { lane: number, tick: number }])
      .sort(([, stepA], [, stepB]) => stepA.tick - stepB.tick)

    switched.forEach(([index, changed], ind) => {
      if (index !== ind) {
        targets.set(steps[ind], changed)
        origins.set(steps[ind], {...steps[ind]})
      }
    })
  })

  return new BatchUpdate(singles, slides, targets, origins, 'move')
}