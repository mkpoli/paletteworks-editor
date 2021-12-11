import type { Note, Timing, Score as SusScore, Meta } from '$lib/score/sus/susdata'
import type { Flick, Single, Slide, SlideTail, SlideStep, SlideHead, Metadata, Score, Beatmap } from './beatmap'

import { analyze, getMetaData } from '$lib/score/sus/analyze'
import { dump } from '$lib/score/sus/generate'
import { LANE_FEVER, LANE_SKILL } from '$lib/consts'

export function getScoreData(sus: string): SusScore {
  const TICKS_PER_BIT = 480
  return analyze(sus, TICKS_PER_BIT)
}

function getKey(note: Note) {
  return `${note.tick}-${note.lane}`
}

export function convertMetaData(meta: Meta): Metadata {
  const { title, artist, designer } = meta
  return { title, artist, author: designer }
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
  score.slideNotes.forEach((slide) => {
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

  score.directionalNotes.forEach((note) => {
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
  score.tapNotes.forEach((note) => {
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

  score.tapNotes
    .filter((note) => {
      if (note.lane === LANE_FEVER && note.width === 1) {
        if (note.type === 1) {
          feverStartTick = note.tick
        } if (note.type === 2) {
          feverEndTick = note.tick
        }
        return false
      } else if (note.lane === LANE_SKILL && note.width === 1 && note.type === 4) {
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
        flick
      })
    })

  const slides: Slide[] = [];
  score.slideNotes.forEach((slide) => {
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

      const easeType =
        easeInMods.has(key)
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
            easeType
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
            critical: criticalMods.has(key)
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
            easeType
          })
          break
        }
      }
    })

    if (head === undefined) throw new Error(`Invalid SlideHead in slide ${JSON.stringify(slide)}`)
    if (tail === undefined) throw new Error(`Invalid SlideTail in slide ${JSON.stringify(slide)}`)

    slides.push({
      head,
      tail,
      steps,
      critical
    })
  })

  const bpms = new Map<number, number>(score.bpms.map(({ tick, value }) => [tick, value]))

  return {
    singles, slides, bpms, skills,
    fever: feverStartTick !== null && feverEndTick !== null ? [feverStartTick, feverEndTick] : null
  }
}


export function loadSUS(sus: string): Beatmap {
  const metadata = convertMetaData(getMetaData(sus))
  const score = convertScoreData(getScoreData(sus))
  return { metadata, score }
}

const FLICK_TO_TYPE = {
  'middle': 1,
  'left': 3,
  'right': 4,
}
export function exportScoreData(score: Score): SusScore {
  const tapNotes: Note[] = []
  const directionalNotes: Note[] = []
  const slideNotes: Note[][] = []
  const bpmNotes: Timing[] = []
  
  const { singles, slides, bpms, fever, skills } = score

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
      type: 1
    })
    if (head.easeType) {
      tapNotes.push({
        tick: head.tick,
        lane: head.lane,
        width: head.width,
        type: 1
      })
      directionalNotes.push({
        tick: head.tick,
        lane: head.lane,
        width: head.width,
        type: head.easeType === 'easeIn' ? 2 : 6
      })
    }
    if (critical) {
      tapNotes.push({
        tick: head.tick,
        lane: head.lane,
        width: head.width,
        type: 2
      })
    }

    // Slide Steps
    steps.forEach(({ tick, lane, width, diamond, easeType, ignored }) => {
      slideNote.push({
        tick,
        lane,
        width,
        type: diamond ? 3 : 5
      })
      if (ignored) {
        tapNotes.push({
          tick,
          lane,
          width,
          type: 3
        })
      }
      if (easeType) {
        tapNotes.push({
          tick,
          lane,
          width,
          type: 1
        })
        directionalNotes.push({
          tick,
          lane,
          width,
          type: easeType === 'easeIn' ? 2 : 6
        })
      }
    })

    // Slide End
    slideNote.push({
      tick: tail.tick,
      lane: tail.lane,
      width: tail.width,
      type: 2
    })
    if (tail.flick !== 'no') {
      directionalNotes.push({
        tick: tail.tick,
        lane: tail.lane,
        width: tail.width,
        type: FLICK_TO_TYPE[tail.flick]
      })
    }
    if (tail.critical) {
      tapNotes.push({
        tick: tail.tick,
        lane: tail.lane,
        width: tail.width,
        type: 2
      })
    }
    slideNotes.push(slideNote)
  })

  bpms.forEach((value, tick) => {
    bpmNotes.push({ tick, value })
  })

  if (bpmNotes.length === 0) {
    bpmNotes.push({ tick: 0, value: 120 })
  }

  const sortKey = ({ tick: a }: Note | Timing, { tick: b }: Note | Timing) => a - b

  tapNotes.sort(sortKey)
  slideNotes.sort(({ 0: { tick: a } }, { 0: { tick : b } }) => a - b)
  directionalNotes.sort(sortKey)
  bpmNotes.sort(sortKey)
  
  return { tapNotes, directionalNotes, slideNotes, bpms: bpmNotes }
}

export function dumpSUS(metadata: Metadata, score: Score): string {
  const { title, artist, author } = metadata
  const susScore: SusScore = exportScoreData(score)
  return dump(
    { title, artist, designer: author }, susScore,
    `This file was generated by PaletteWorks Editor v${ process.env.PACKAGE_VERSION }`
  )
}