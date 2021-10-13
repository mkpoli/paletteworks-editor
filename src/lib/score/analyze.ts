// Based on https://github.com/NonSpicyBurrito/sonolus-pjsekai-engine/blob/master/src/lib/sus/analyze.ts

type Line = [string, string]
type RawObject = {
  tick: number
  value: string
}

export type NoteObject = {
  tick: number
  lane: number
  width: number
  type: number
}

type BPM = {
  tick: number;
  bpm: number;
}

export type Score = {
  tapNotes: NoteObject[]
  directionalNotes: NoteObject[]
  slides: NoteObject[][]
  bpms: BPM[]
}

const beatsPerMeasure = 4
export function analyze(sus: string, ticksPerBeat: number): Score {
  const lines = sus
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('#') && line.includes(':'))
    .map((line): Line => {
      const index = line.indexOf(':')
      return [
        line.substring(1, index).trim(),
        line.substring(index + 1).trim(),
      ]
    })

  const bpmMap = new Map<string, number>()
  const bpmChangeObjects: RawObject[] = []
  // const bpbChangeObjects: RawObject[] = []
  const tapNotes: NoteObject[] = []
  const directionalNotes: NoteObject[] = []
  const streams = new Map<string, NoteObject[]>()

  lines.forEach((line) => {
    const [header, data] = line

    // BPM
    if (header.length === 5 && header.startsWith('BPM')) {
      bpmMap.set(header.substring(3), +data)
      return
    }

    // BPM Change
    if (header.length === 5 && header.endsWith('08')) {
      bpmChangeObjects.push(...toRawObjects(line, ticksPerBeat))
      return
    }

    // Tap Notes
    if (header.length === 5 && header[3] === '1') {
      tapNotes.push(...toNoteObjects(line, ticksPerBeat))
      return
    }

    // Tap Notes
    if (header.length === 6 && header[3] === '3') {
      const channel = header[5]
      const stream = streams.get(channel)
      if (stream) {
        stream.push(...toNoteObjects(line, ticksPerBeat))
      } else {
        streams.set(channel, toNoteObjects(line, ticksPerBeat))
      }
      return
    }

    // Directional Notes
    if (header.length === 5 && header[3] === '5') {
      directionalNotes.push(...toNoteObjects(line, ticksPerBeat))
      return
    }
  })

  const slides = [...streams.values()].map(toSlides).flat()

  let time = 0
  const bpms = bpmChangeObjects
    .sort((a, b) => a.tick - b.tick)
    .map(({ tick, value }) => ({ tick, bpm: bpmMap.get(value) || 0 }))
    .map(({ tick, bpm }, i, values) => {
      const prev = values[i - 1]
      if (prev) {
        time += ((tick - prev.tick) * 60) / ticksPerBeat / prev.bpm
      }

      return { tick, bpm }
    })
    .reverse()

  return {
    tapNotes,
    directionalNotes,
    slides,
    bpms
  }
}

function toSlides(stream: NoteObject[]) {
  const slides: NoteObject[][] = []

  let current: NoteObject[] | undefined
  stream
    .sort((a, b) => a.tick - b.tick)
    .forEach((note) => {
      if (!current) {
        current = []
        slides.push(current)
      }

      current.push(note)

      if (note.type === 2) {
        current = undefined
      }
    })

  return slides
}

function toNoteObjects(line: Line, ticksPerBeat: number) {
  const [header] = line
  const lane = parseInt(header[4], 36)

  return toRawObjects(line, ticksPerBeat).map(({ tick, value }) => {
    const width = parseInt(value[1], 36)

    return {
      tick,
      lane,
      width,
      type: parseInt(value[0], 36),
    }
  })
}

function toRawObjects([header, data]: Line, ticksPerBeat: number) {
  const measure = +header.substring(0, 3)
  return (data.match(/.{2}/g) || [])
    .map(
      (value, i, values) =>
        value !== '00' && {
          tick:
            measure * beatsPerMeasure * ticksPerBeat +
            (i * beatsPerMeasure * ticksPerBeat) / values.length,
          value,
        }
    )
    .filter((object): object is RawObject => !!object)
}