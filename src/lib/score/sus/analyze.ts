// Based on https://github.com/NonSpicyBurrito/sonolus-pjsekai-engine/blob/master/src/lib/sus/analyze.ts

import type { Meta, Score, Timing, Note } from "./susdata"

type Line = [string, string]
type RawObject = {
  tick: number
  value: string
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
  const tapNotes: Note[] = []
  const directionalNotes: Note[] = []
  const streams = new Map<string, Note[]>()

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

  const slideNotes = [...streams.values()].map(toSlides).flat()

  const bpms: Timing[] = bpmChangeObjects
    .sort((a, b) => a.tick - b.tick)
    .map(({ tick, value }) => ({ tick, value: bpmMap.get(value) || 0 }))
    .reverse()

  return {
    tapNotes,
    directionalNotes,
    slideNotes,
    bpms
  }
}

function toSlides(stream: Note[]) {
  const slides: Note[][] = []

  let current: Note[] | undefined
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


export function getMetaData(sus: string): Meta {
  const lines = sus
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('#') && !line.includes(':'))
    .map((line): [string, string] => {
      const index = line.indexOf(' ')
      return [
        line.substring(1, index).trim(),
        line.substring(index + 1).trim(),
      ]
    })

  const metadata: Meta = {
    title: '',
    artist: '',
    designer: ''
  }
  lines.forEach(([header, data]) => {
    data = data.replace(/^"(.*(?="$))"$/, '$1')
    switch (header) {
      case 'TITLE':
        metadata.title = data
        break
      case 'ARTIST':
        metadata.artist = data
        break
      case 'DESIGNER':
        metadata.designer = data
        break
      default:
        break
    }
  })
  return metadata
}