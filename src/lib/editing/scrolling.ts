import { snap } from "$lib/basic/math"
import { MARGIN_BOTTOM, TICK_HEIGHT } from "$lib/consts"
import { position } from "$lib/position"
import { get, writable } from "svelte/store"

export const SCROLL_MODES = [
  'page', 'smooth', 'none'
] as const
export type ScrollMode = typeof SCROLL_MODES[number]

export function calcScrollTick(y: number, zoom: number): number {
  return (MARGIN_BOTTOM - y) / (TICK_HEIGHT * zoom)
}

export function calcScrollY(tick: number, zoom: number): number {
  return MARGIN_BOTTOM - (TICK_HEIGHT * zoom) * tick
}

export const scrollY = writable<number>(0)

type ScrollFunction = (currentTick: number) => number
export const SCROLL_FUNCTIONS: Record<ScrollMode, ScrollFunction | undefined> = {
  'page': (currentTick: number) => {
    const pos = get(position)
    return snap(currentTick + pos.calcDistanceTicks(MARGIN_BOTTOM), pos.calcDistanceTicks(pos.containerHeight) * 0.76)
  },
  'smooth': (currentTick: number) => {
    const pos = get(position)
    return currentTick - pos.calcDistanceTicks(pos.containerHeight * 0.5) + pos.calcDistanceTicks(MARGIN_BOTTOM)
    // currentTick - innerHeight / measureHeight * TICK_PER_MEASURE * 0.5 + MARGIN_BOTTOM / MEASURE_HEIGHT * TICK_PER_MEASURE
  },
  'none': undefined
} as const 
