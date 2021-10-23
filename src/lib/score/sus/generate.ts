import * as math from "$lib/basic/math"
import { BEAT_IN_MEASURE, TICK_PER_BEAT, TICK_PER_MEASURE } from "$lib/consts"
import type { Meta, Score } from '$lib/score/sus/susdata'
export type Raw = {
  tick: number
  value: string
}

class DefaultMap<K, V> extends Map<K, V> {
  generateDefault: () => V

  constructor(generateDefault: () => V) {
    super()
    this.generateDefault = generateDefault
  }

  get(key: K) {
    const value = super.get(key)
    if (value === undefined) {
      const defaultValue: V = this.generateDefault()
      super.set(key, defaultValue)
      return defaultValue
    } else {
      return value
    }
  }
}

class ChannelProvider {
  #channelMap: [identifier: number, data: [start: number, end: number]][]
  constructor() {
    this.#channelMap = [...Array(36).keys()].map((key) => [key, [0, 0]])
  }

  generateChannel(startTick: number, endTick: number): number {
    const channel = this.#channelMap.find(([, [start, end]]) => 
      start === 0 && end === 0 || endTick < start || end < startTick
    )
    channel[1] = [startTick, endTick]
    return channel[0]
  }
}

export function dump(metadata: Meta, score: Score, comment: string) {
  const lines = []
  lines.push(comment)
  lines.push(`#TITLE "${metadata.title}"`)
  lines.push(`#ARTIST "${metadata.artist}"`)
  lines.push(`#DESIGNER "${metadata.designer}"`)
  lines.push(``)
  lines.push(`#REQUEST "ticks_per_beat ${TICK_PER_BEAT}"`)
  lines.push(``)

  const noteMaps: DefaultMap<string, Raw[]> = new DefaultMap(() => [])

  const pushRaw = (tick: number, info: string, data: string) => {
    const currentMeasure = Math.floor(tick / TICK_PER_BEAT / BEAT_IN_MEASURE)
    noteMaps.get(`${currentMeasure.toString().padStart(3, '0')}${info}`).push({ tick, value: data })
  }

  const { bpms, tapNotes, directionalNotes, slideNotes } = score
  
  if (bpms.length >= 36 ** 2 - 1) {
    throw new Error(`Too much BPMS (${bpms.length} >= 36^2 -1 = ${36 ** 2 - 1})`); 
  }
  const bpmIdentifiers = new Map()
  bpms.forEach(({ tick, value }) => {
    const identifier = (bpmIdentifiers.size + 1).toString(36).padStart(2, '0')
    if (!bpmIdentifiers.has(value)) {
      bpmIdentifiers.set(value, identifier)
      lines.push(`#BPM${bpmIdentifiers.get(value)}:${value}`)
    }
    pushRaw(tick, `08`, bpmIdentifiers.get(value) ?? identifier)
  })

  tapNotes.forEach(({ tick, lane, width, type }) => {
    pushRaw(tick, `1${lane.toString(36)}`, `${type}${width.toString(36)}`)
  })

  directionalNotes.forEach(({ tick, lane, width, type }) => {
    pushRaw(tick, `5${lane.toString(36)}`, `${type}${width.toString(36)}`)
  })

  const provider = new ChannelProvider()
  slideNotes.forEach((steps) => {
    const startTick = steps[0].tick
    const endTick = steps[steps.length - 1].tick
    const channel = provider.generateChannel(startTick, endTick).toString(36)
    steps.forEach(({ tick, lane, width, type }) => {
      pushRaw(tick, `3${lane.toString(36)}${channel}`, `${type}${width.toString(36)}`)
    })
  })
  
  noteMaps.forEach((raws, tag) => {
    const gcd = raws.reduce((acc, ele) => math.gcd(ele.tick, acc), TICK_PER_MEASURE)
    const data = new Map(raws
      .sort(({ tick: a }, { tick: b }) => a - b)
      .map(({ tick, value }) => [tick % TICK_PER_MEASURE, value])
    )
    const values: string[] = []
    for (let i = 0; i * gcd < TICK_PER_MEASURE; i++) {
      const tick = i * gcd
      values.push(data.has(tick) ? data.get(tick) : `00`)
    }
    lines.push(`#${tag}:${values.join('')}`)
  }) 

  return lines.join('\n')
}
