import type { TimeSignature } from '$lib/score/beatmap'

import { writable } from 'svelte/store'
import { snap } from './basic/math'
import { TICK_PER_BEAT } from './consts'

export const sortedBPMs = writable<[number, number][]>([])

export function tick2secs(tick: number, tpb: number, bpm: number): number {
  return tick / tpb / bpm * 60
}

export function accumulateDuration(targetTick: number, bpms: [tick: number, bpm: number][], tpb: number): number {
  return bpms
    .filter(([tick,]) => tick <= targetTick)
    .reduce((acc, [tick, bpm], ind, arr) =>
      acc + (ind < arr.length - 1 ? tick2secs(arr[ind + 1][0] - tick, tpb, +bpm) : tick2secs(targetTick - tick, tpb, +bpm))
    , 0)
}

export type TimeSignatureInfo = {
  measure: number, startTick: number, beatsPerMeasure: number, p: number, q: number,
}

export class TimeSignatureManager {
  timeSignatureInfos: TimeSignatureInfo[]
  constructor(timeSignatures: Map<number, TimeSignature>) {
    let accumulatedTicks = 0
    this.timeSignatureInfos = [...timeSignatures]
      .sort(([a,], [b,]) => a - b)
      .map(([measure, timeSignature], ind, arr) => {
        const [nextMeasure] = arr[ind + 1] ?? [Infinity]
        const startTick = accumulatedTicks
        const [p, q] = timeSignature
        const beatsPerMeasure = p / q * 4
        accumulatedTicks += (nextMeasure - measure) * beatsPerMeasure * TICK_PER_BEAT
        return { measure, beatsPerMeasure, p, q, startTick }
      })
  }

  private find(tick: number): TimeSignatureInfo | undefined {
    return [...this.timeSignatureInfos].reverse().find(({ startTick }) => startTick <= tick)
  }

  get(tick: number): number {
    const { beatsPerMeasure } = this.find(tick) ?? this.timeSignatureInfos[0]
    return beatsPerMeasure
  }

  tick2measure(tick: number): number {
    const { measure, startTick, beatsPerMeasure } = this.find(tick) ?? this.timeSignatureInfos[0]
    return Math.floor(measure + (tick - startTick) / TICK_PER_BEAT / beatsPerMeasure)
  }

  has(tick: number): boolean {
    return this.timeSignatureInfos.some(({ measure }) => this.tick2measure(tick) === measure)
  }

  snap(tick: number, snapTo: number): number {
    const { p, beatsPerMeasure } = this.find(tick) ?? this.timeSignatureInfos[0]
    return snap(tick, TICK_PER_BEAT * beatsPerMeasure / p / snapTo * 4)
  }

  getTickRanges(): [number, number][] {
    return this.timeSignatureInfos.map(({ startTick }, ind, arr) => [
      startTick,
      arr[ind + 1]?.startTick ?? Infinity
    ])
  }
}
