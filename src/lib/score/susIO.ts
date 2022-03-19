import { parse, stringify } from 'sus-io'
import type {
  Score as SusScore,
  Metadata as SusMetadata,
  ScoreData as SusScoreData,
  Note,
} from 'sus-io'

import type {
  Flick,
  Single,
  Slide,
  SlideTail,
  SlideStep,
  SlideHead,
  Metadata,
  Score,
  Beatmap,
} from './beatmap'

import { LANE_FEVER, LANE_SKILL } from '$lib/consts'
import { gcd } from '$lib/basic/math'

function getKey(note: Note) {
  return `${note.tick}-${note.lane}`
}

export function convertMetaData(metadata: SusMetadata): Metadata {
  return {
    title: metadata.title ?? '',
    artist: metadata.title ?? '',
    author: metadata.designer ?? '',
    offset: metadata.waveoffset ?? 0,
  }
}

export function convertScoreData(score: SusScore): Score {
  // Modifier Notes
  const flickMods = new Map<string, Flick>()
  const criticalMods = new Set<string>()
  const stepRemoveMods = new Set<string>()
  const easeInMods = new Set<string>()
  const easeOutMods = new Set<string>()
  const skills = new Set<number>()

  const slideKeys = new Set<string>()
  score.slides.forEach((slide) => {
    slide.forEach((note) => {
      const key = getKey(note)
      switch (note.type) {
        case 1:
        case 2:
        case 3:
        case 5:
          slideKeys.add(key)
          break
      }
    })
  })

  score.directionals.forEach((note) => {
    const key = getKey(note)
    switch (note.type) {
      case 1:
        flickMods.set(key, 'middle')
        break
      case 3:
        flickMods.set(key, 'left')
        break
      case 4:
        flickMods.set(key, 'right')
        break
      case 2:
        easeInMods.add(key)
        break
      case 5:
      case 6:
        easeOutMods.add(key)
        break
    }
  })
  score.taps.forEach((note) => {
    const key = getKey(note)
    switch (note.type) {
      case 2:
        criticalMods.add(key)
        break
      case 3:
        stepRemoveMods.add(key)
        break
    }
  })

  const tapKeys = new Set<string>()
  const singles: Single[] = []

  let feverStartTick: number | null = null
  let feverEndTick: number | null = null

  score.taps
    .filter((note) => {
      if (note.lane === LANE_FEVER && note.width === 1) {
        if (note.type === 1) {
          feverStartTick = note.tick
        }
        if (note.type === 2) {
          feverEndTick = note.tick
        }
        return false
      } else if (
        note.lane === LANE_SKILL &&
        note.width === 1 &&
        note.type === 4
      ) {
        skills.add(note.tick)
        return false
      } else {
        return true
      }
      // note.lane >= LANE_MIN && note.lane <= LANE_MAX
    })
    .forEach((note) => {
      const key = getKey(note)
      if (slideKeys.has(key)) return

      if (note.type !== 1 && note.type !== 2) return
      if (tapKeys.has(key)) return
      tapKeys.add(key)

      const { lane, tick, width } = note
      const flick = flickMods.get(key) || 'no'
      const critical = note.type === 2
      singles.push({
        lane,
        tick,
        width,
        critical,
        flick,
      })
    })

  const slides: Slide[] = []
  score.slides.forEach((slide) => {
    const key = slide.map(getKey).join('|')
    if (slideKeys.has(key)) return
    slideKeys.add(key)

    const startNote = slide.find(({ type }) => type === 1 || type === 2)
    if (!startNote) return

    const critical = criticalMods.has(getKey(startNote))

    let head: SlideHead | undefined = undefined
    let tail: SlideTail | undefined = undefined
    const steps: SlideStep[] = []

    slide.forEach((note) => {
      const key = getKey(note)
      const { tick, lane, width } = note

      const easeType = easeInMods.has(key)
        ? 'easeIn'
        : easeOutMods.has(key)
        ? 'easeOut'
        : false

      switch (note.type) {
        case 1: {
          // Start Note
          head = {
            tick,
            lane,
            width,
            easeType,
          }
          break
        }
        case 2: {
          // End Note
          const flick = flickMods.get(key) || 'no'
          tail = {
            tick,
            lane,
            width,
            flick,
            critical: criticalMods.has(key),
          }
          break
        }
        case 3:
        case 5: {
          // Step Note
          steps.push({
            tick,
            lane,
            width,
            diamond: note.type === 3,
            ignored: stepRemoveMods.has(key) ? true : false,
            easeType,
          })
          break
        }
      }
    })

    if (head === undefined)
      throw new Error(`Invalid SlideHead in slide ${JSON.stringify(slide)}`)
    if (tail === undefined)
      throw new Error(`Invalid SlideTail in slide ${JSON.stringify(slide)}`)

    slides.push({
      head,
      tail,
      steps,
      critical,
    })
  })

  const bpms = new Map<number, number>(score.bpms)

  const timeSignatures = new Map<number, [number, number]>(
    score.barLengths.map(([measure, value]) => [measure, simplify4(value, 4)])
  )

  return {
    singles,
    slides,
    bpms,
    skills,
    fever:
      feverStartTick !== null && feverEndTick !== null
        ? [feverStartTick, feverEndTick]
        : null,
    timeSignatures,
  }
}

// Make denominator equals to 4
function simplify4(numerator: number, denominator: number): [number, number] {
  const g = gcd(numerator, denominator)
  const n = numerator / g
  const d = denominator / g
  if (d % 4 === 0) {
    return [n, d]
  } else {
    return [n * 4, d * 4]
  }
}

export function loadSUS(sus: string): Beatmap {
  const susScore = parse(sus)
  const metadata = convertMetaData(susScore.metadata)
  const score = convertScoreData(susScore)
  return { metadata, score }
}

const FLICK_TO_TYPE = {
  middle: 1,
  left: 3,
  right: 4,
}
export function exportScoreData(score: Score): SusScoreData {
  const tapNotes: Note[] = []
  const directionalNotes: Note[] = []
  const slideNotes: Note[][] = []
  const bpmNotes: [tick: number, bpm: number][] = []

  const { singles, slides, bpms, fever, skills, timeSignatures } = score

  if (fever) {
    const [start, end] = fever
    tapNotes.push({ tick: start, width: 1, lane: LANE_FEVER, type: 1 })
    tapNotes.push({ tick: end, width: 1, lane: LANE_FEVER, type: 2 })
  }

  skills.forEach((skill) => {
    tapNotes.push({ tick: skill, width: 1, lane: LANE_SKILL, type: 4 })
  })

  singles.forEach(({ tick, lane, width, critical, flick }) => {
    tapNotes.push({ tick, lane, width, type: critical ? 2 : 1 })
    if (flick !== 'no') {
      directionalNotes.push({ tick, lane, width, type: FLICK_TO_TYPE[flick] })
    }
  })

  slides.forEach(({ head, tail, steps, critical }) => {
    const slideNote: Note[] = []

    // Slide Start
    slideNote.push({
      tick: head.tick,
      lane: head.lane,
      width: head.width,
      type: 1,
    })
    if (head.easeType) {
      tapNotes.push({
        tick: head.tick,
        lane: head.lane,
        width: head.width,
        type: 1,
      })
      directionalNotes.push({
        tick: head.tick,
        lane: head.lane,
        width: head.width,
        type: head.easeType === 'easeIn' ? 2 : 6,
      })
    }
    if (critical) {
      tapNotes.push({
        tick: head.tick,
        lane: head.lane,
        width: head.width,
        type: 2,
      })
    }

    // Slide Steps
    steps.forEach(({ tick, lane, width, diamond, easeType, ignored }) => {
      slideNote.push({
        tick,
        lane,
        width,
        type: diamond ? 3 : 5,
      })
      if (ignored) {
        tapNotes.push({
          tick,
          lane,
          width,
          type: 3,
        })
      } else if (easeType) {
        tapNotes.push({
          tick,
          lane,
          width,
          type: 1,
        })
        directionalNotes.push({
          tick,
          lane,
          width,
          type: easeType === 'easeIn' ? 2 : 6,
        })
      }
    })

    // Slide End
    slideNote.push({
      tick: tail.tick,
      lane: tail.lane,
      width: tail.width,
      type: 2,
    })
    if (tail.flick !== 'no') {
      directionalNotes.push({
        tick: tail.tick,
        lane: tail.lane,
        width: tail.width,
        type: FLICK_TO_TYPE[tail.flick],
      })
    }
    if (tail.critical) {
      tapNotes.push({
        tick: tail.tick,
        lane: tail.lane,
        width: tail.width,
        type: 2,
      })
    }
    slideNotes.push(slideNote)
  })

  bpms.forEach((value, tick) => {
    bpmNotes.push([tick, value])
  })

  if (bpmNotes.length === 0) {
    bpmNotes.push([0, 120])
  }

  tapNotes.sort(({ tick: a }, { tick: b }) => a - b)
  slideNotes.sort(({ 0: { tick: a } }, { 0: { tick: b } }) => a - b)
  directionalNotes.sort(({ tick: a }, { tick: b }) => a - b)
  bpmNotes.sort(([a], [b]) => a - b)

  const barLengths = [...timeSignatures]
    .map(
      ([measure, [p, q]]) =>
        [measure, (p / q) * 4] as [measure: number, length: number]
    )
    .sort((a, b) => a[0] - b[0])

  return {
    taps: tapNotes,
    directionals: directionalNotes,
    slides: slideNotes,
    bpms: bpmNotes,
    barLengths,
  }
}

export function dumpSUS(metadata: Metadata, score: Score): string {
  const { title, artist, author, offset } = metadata
  const scoreData: SusScoreData = exportScoreData(score)
  return stringify(
    {
      metadata: {
        title,
        artist,
        designer: author,
        waveoffset: offset,
        requests: ['ticks_per_beat 480'],
      },
      ...scoreData,
    },
    `This file was generated by PaletteWorks Editor v${process.env.PACKAGE_VERSION}`
  )
}
