import { MARGIN_BOTTOM, TICK_HEIGHT } from "$lib/consts"
import { writable } from "svelte/store"

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