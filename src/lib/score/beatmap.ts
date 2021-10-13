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

interface IEase {
  easeType: 'easeIn' | 'easeOut' | false,
}

export type Single = INote & IDirectional & ICritical
export type SlideStart = INote & IEase
export type SlideStep = INote & {
  diamond: boolean,
  ignored: boolean,
} & IEase
export type SlideEnd = INote & IDirectional
export type SlideNote = SlideStart | SlideStep | SlideEnd
export type Slide = {
  start: SlideStart
  end: SlideEnd
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