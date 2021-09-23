import { MARGIN, MARGIN_BOTTOM } from '$lib/consts'

export function calcX(lane: number) {
  // return MARGIN + lane * 30 - 12
  return MARGIN + lane * 30
}

export function calcY(tick: number, measureHeight: number) {
  return innerHeight - (MARGIN_BOTTOM + (tick / 480) * measureHeight / 4)
}
