export interface MetaData {
  title: string
  artist: string
}

export interface INote {
  tick: number
  lane: number
  width: number
}

export type Flick = 'left' | 'middle' | 'right' | false

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
export type SlideStart = INote & ICritical & IEase
export type SlideStep = INote & {
  diamond: boolean,
  ignored: boolean,
} & IEase
export type SlideEnd = INote & IDirectional
export type Slide = {
  start: SlideStart
  end: SlideEnd
  steps: SlideStep[]
} & ICritical
export type BPM = {
  tick: number
  bpm: number
}