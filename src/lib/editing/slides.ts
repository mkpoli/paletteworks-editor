import type { Slide, SlideNote } from "$lib/score/beatmap";

export function getSlideNotes({ head, tail, steps }: Slide): SlideNote[] {
  return [head, ...steps, tail]
}