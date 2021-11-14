export interface Metadata {
  title: string
  artist: string
  author: string
}

export interface INote {
  tick: number
  lane: number
  width: number
}

export const FLICK_TYPES = ['no', 'left', 'middle', 'right'] as const
export type Flick = typeof FLICK_TYPES[number]

interface IDirectional {
  flick: Flick
}

interface ICritical {
  critical: boolean
}

export const EASE_TYPES = ['easeIn', 'easeOut', false]
export type EaseType = typeof EASE_TYPES[number]

export const DIAMOND_TYPES = ['ignored', 'visible', 'invisible']
export type DiamondType = typeof DIAMOND_TYPES[number]

export function toDiamondType(diamond: boolean, ignored: boolean): DiamondType {
  return ignored
    ? 'ignored'
    : diamond
      ? 'visible'
      : 'invisible'
}

export function fromDiamondType(diamondType: DiamondType): [diamond: boolean, ignored: boolean] {
  return {
    'visible': [true, false],
    'invisible': [false, false],
    'ignored': [true, true],
  }[diamondType] as [boolean, boolean]
}

export interface IEase {
  easeType: EaseType,
}

export function hasEaseType(note: Note): note is Note & IEase {
  return 'easeType' in note
}

export function isSlideStep(note: Note): note is SlideStep {
  return 'diamond' in note && 'ignored' in note
}

export type Single = INote & IDirectional & ICritical
export type SlideHead = INote & IEase
export type SlideStep = INote & {
  diamond: boolean,
  ignored: boolean,
} & IEase
export type SlideTail = INote & IDirectional & ICritical
export type SlideNote = SlideHead | SlideStep | SlideTail
export type Slide = {
  head: SlideHead
  tail: SlideTail
  steps: SlideStep[]
} & ICritical

export type Score = {
  singles: Single[]
  slides: Slide[]
  bpms: Map<number, number>
}

export type Beatmap = {
  metadata: Metadata
  score: Score
}
export type Note = Single | SlideNote