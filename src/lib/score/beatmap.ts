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

export function hasEaseType(note: Note): note is Note & IEase {
  return 'easeType' in note
}

export function isSlideStep(note: Note): note is SlideStep {
  return 'diamond' in note && 'ignored' in note
}

export function isSlideHead(note: Note): note is SlideHead {
  return 'easeType' in note && !('diamond' in note)
}

export function hasFlick(note: Note): note is Note & IDirectional {
  return 'flick' in note
}

export function hasCritical(note: Note): note is Note & ICritical {
  return 'critical' in note
}

export type Fever = [startTick: number, endTick: number] | null
export type TimeSignature = [beats: number, beatType: number]

export type Score = {
  singles: Single[]
  slides: Slide[]
  bpms: Map<number, number>
  fever: Fever,
  skills: Set<number>,
  timeSignatures: Map<number, TimeSignature>,
}

export interface SerialisedScore {
  singles: Single[]
  slides: Slide[]
  bpms: [number, number][]
  fever: Fever
  skills: number[]
  timeSignatures: [number, TimeSignature][]
}

export function serialiseScore(score: Score): SerialisedScore {
  const { singles, slides, bpms, fever, skills, timeSignatures } = score
  return {
    singles,
    slides,
    bpms: [...bpms],
    fever,
    skills: [...skills],
    timeSignatures: [...timeSignatures]
  }
}

export function deserialiseScore(serialisedScore: SerialisedScore): Score {
  const { singles, slides, bpms, fever, skills, timeSignatures } = serialisedScore
  return {
    singles,
    slides,
    bpms: new Map(bpms),
    fever,
    skills: new Set(skills),
    timeSignatures: new Map(timeSignatures)
  }
}

export type Beatmap = {
  metadata: Metadata
  score: Score
}

export const NOTE_TYPES = ['tap', 'critical', 'flick', 'slide'] as const
export type Type = typeof NOTE_TYPES[number]
export function calcType(critical: boolean, flick: Flick, slide: boolean): Type {
  return critical
          ? 'critical'
          : flick !== 'no'
            ? 'flick'
            : slide
              ? 'slide'
              : 'tap'
}

export type Note = Single | SlideNote