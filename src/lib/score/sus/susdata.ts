export type Note = {
  tick: number
  lane: number
  width: number
  type: number
}

export type Timing = {
  tick: number
  value: number
}

export type Score = {
  tapNotes: Note[]
  directionalNotes: Note[]
  slideNotes: Note[][]
  bpms: Timing[]
}

export type Meta = {
  title: string
  artist: string
  designer: string
}