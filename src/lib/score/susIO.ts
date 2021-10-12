import * as analyzer from 'sus-analyzer'
export default analyzer

import { analyze } from './analyze';
import type { Score } from './analyze'

export function getMetaData(sus: string): MetaData {
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

  const metadata: MetaData = {
    title: '',
    artist: '',
    author: ''
  }
  lines.forEach(([header, data]) => {
    data = data.replace(/^"(.+(?="$))"$/, '$1');
    switch (header) {
      case 'TITLE':
        metadata.title = data
        break
      case 'ARTIST':
        metadata.artist = data
        break
      case 'DESIGNER':
        metadata.author = data
      default:
        break
    }
  })
  return metadata
}

export function getScoreData(sus: string) {
  const TICKS_PER_BIT = 480
  console.log('SusAnalyzer', analyzer.getScore(sus, 480))
  return analyze(sus, TICKS_PER_BIT)
}


import type { NoteObject } from './analyze'

function getKey(note: NoteObject) {
  return `${note.tick}-${note.lane}`
}

import type { Flick, Single, Slide, SlideEnd, SlideStep, SlideStart, MetaData } from './beatmap'


export function convertScoreData(score: Score): {
  singleNotes: Single[],
  slides: Slide[],
  bpms: Map<number, number>
} {
  const offset = 0
  function toTime(tick: number) {
    return score.toTime(tick) + offset
  }
  // Modifier Notes
  const flickMods = new Map<string, Flick>()
  const criticalMods = new Set<string>()
  const stepRemoveMods = new Set<string>()
  const easeInMods = new Set<string>()
  const easeOutMods = new Set<string>()

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
  const singleNotes: Single[] = []
  score.tapNotes
    .filter((note) => note.lane > 1 && note.lane < 14)
    .forEach((note) => {
      const key = getKey(note)
      if (slideKeys.has(key)) return

      // const time = toTime(note.tick)

      if (note.type !== 1 && note.type !== 2) return
      if (tapKeys.has(key)) return
      tapKeys.add(key)
      
      // const flickMod = flickMods.get(key) 
      const { lane, tick, width } = note
      const flick = flickMods.get(key) || 'no'
      const critical = note.type === 2
      singleNotes.push({
        lane,
        tick,
        width,
        critical,
        flick
      })
    })

  const slides: Slide[] = [];
  score.slides.forEach((slide) => {
    const key = slide.map(getKey).join('|')
    if (slideKeys.has(key)) return
    slideKeys.add(key)

    const startNote = slide.find(({ type }) => type === 1 || type === 2)
    if (!startNote) return

    const critical = criticalMods.has(getKey(startNote))

    const isStartCritical = criticalMods.has(getKey(startNote))

    let start: SlideStart
    let end: SlideEnd
    const steps: SlideStep[] = []

    slide.forEach((note) => {
      const key = getKey(note)
      const time = toTime(note.tick)
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
          start = {
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
          end = {
            tick,
            lane,
            width,
            flick
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

    slides.push({
      start,
      end,
      steps,
      critical
    })
  })

  const bpms = new Map<number, number>(score.timings.map(({ tick, bpm }) => [tick, bpm]))

  return { singleNotes, slides, bpms }
}