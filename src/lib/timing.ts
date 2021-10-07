import { LANE_WIDTH, MARGIN, MARGIN_BOTTOM, TICK_PER_MEASURE } from '$lib/consts'

export function calcX(lane: number) {
  return MARGIN + (lane - 1) * LANE_WIDTH
}

export function calcMidX(lane: number, width: number) {
  return MARGIN + (lane - 1 + width / 2) * LANE_WIDTH
}

export function calcY(tick: number, measureHeight: number): number {
  return innerHeight - (MARGIN_BOTTOM + (tick / TICK_PER_MEASURE) * measureHeight)
}

export function calcTick(y: number, measureHeight: number): number {
  return TICK_PER_MEASURE * (innerHeight - y - MARGIN_BOTTOM) / measureHeight
}

export function calcLane(x: number) {
  return (x - MARGIN) / LANE_WIDTH
}