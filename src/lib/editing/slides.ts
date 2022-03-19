import type { INote, Slide, SlideNote } from '$lib/score/beatmap'
import { AddRemoveSlides } from '$lib/editing/mutations'

export function getSlideNotes({ head, tail, steps }: Slide): SlideNote[] {
  return [head, ...steps, tail]
}

export function combineSlides(
  slides: Slide[],
  a: Slide,
  b: Slide,
  target: INote
): AddRemoveSlides {
  const slide = {
    head: a.head,
    tail: b.tail,
    steps: [
      ...a.steps,
      {
        tick: target.tick,
        lane: target.lane,
        width: target.width,
        diamond: false,
        ignored: false,
        easeType: b.head.easeType,
      },
      ...b.steps,
    ],
    critical: a.critical || b.critical,
  }
  return new AddRemoveSlides(slides, [slide], [a, b], 1, 'combine')
}
