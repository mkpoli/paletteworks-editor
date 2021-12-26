export interface Metadata {
  title: string
  artist: string
  author: string
  offset: number
}

export interface INote {
  tick: number
  lane: number
  width: number
}

export const FLICK_TYPES = ['no', 'middle', 'left', 'right'] as const
export type Flick = typeof FLICK_TYPES[number]

export interface IDirectional {
  flick: Flick
}

export interface ICritical {
  critical: boolean
}

export interface IDiamond {
  diamond: boolean,
  ignored: boolean,
}

export const EASE_TYPES = ['easeIn', 'easeOut', false]
export type EaseType = typeof EASE_TYPES[number]

export const DIAMOND_TYPES = ['ignored', 'visible', 'invisible'] as const
export type DiamondType = typeof DIAMOND_TYPES[number]

export function toDiamondType({ diamond, ignored }: IDiamond): DiamondType {
  return ignored
    ? 'ignored'
    : diamond
      ? 'visible'
      : 'invisible'
}

export function fromDiamondType(diamondType: DiamondType): IDiamond {
  switch (diamondType) {
    case 'visible': return { diamond: true, ignored: false }
    case 'invisible': return { diamond: false, ignored: false }
    case 'ignored': return { diamond: true, ignored: true }
  }
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

export function hasFlick(note: Note): note is Note & IDirectional {
  return 'flick' in note
}

export type Single = INote & IDirectional & ICritical
export type SlideHead = INote & IEase
export type SlideStep = INote & IDiamond & IEase
export type SlideTail = INote & IDirectional & ICritical
export type SlideNote = SlideHead | SlideStep | SlideTail
export type Slide = {
  head: SlideHead
  tail: SlideTail
  steps: SlideStep[]
} & ICritical

export type Fever = [startTick: number, endTick: number] | null

export type Score = {
  singles: Single[]
  slides: Slide[]
  bpms: Map<number, number>
  fever: Fever,
  skills: Set<number>,
  timeSignatures: Map<number, [number, number]>,
}

export type Beatmap = {
  metadata: Metadata
  score: Score
}

export type Type = 'tap' | 'critical' | 'flick' | 'slide'

export type Note = Single | SlideNote