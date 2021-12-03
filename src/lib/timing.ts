import { writable } from 'svelte/store'

export const sortedBPMs = writable<[number, number][]>([])

export function tick2secs(tick: number, tpb: number, bpm: number): number {
  return tick / tpb / bpm * 60
}

export function accumulateDuration(targetTick: number, bpms: [tick: number, bpm: number][], tpb: number): number {
  console.log('filtered', bpms.filter(([tick,]) => tick <= targetTick))
  return bpms
    .filter(([tick,]) => tick <= targetTick)
    .reduce((acc, [tick, bpm], ind, arr) =>
      acc + (ind < arr.length - 1 ? tick2secs(arr[ind + 1][0] - tick, tpb, +bpm) : tick2secs(targetTick - tick, tpb, +bpm))
    , 0)
}