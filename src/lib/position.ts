import { between, clamp, snap } from "./basic/math"
import {
  LANE_MAX,
  LANE_MIN,
  LANE_WIDTH,
  MARGIN,
  MARGIN_BOTTOM,
  TICK_PER_MEASURE,
} from "./consts"
import { writable } from 'svelte/store'

interface IRect {
  top: number,
  bottom: number,
  left: number,
  right: number,
  height: number,
  width: number,
  x: number,
  y: number,
}

export class PositionManager {
  measureHeight: number
  scrollTick: number
  snapTo: number
  containerHeight: number

  constructor(measureHeight: number, scrollTick: number, snapTo: number, containerHeight: number) {
    this.measureHeight = measureHeight
    this.scrollTick = scrollTick
    this.snapTo = snapTo
    this.containerHeight = containerHeight
  }

  calcX(lane: number): number {
    return MARGIN + (lane - 1) * LANE_WIDTH
  }
  
  calcMidX(lane: number, width: number): number {
    return MARGIN + (lane - 1 + width / 2) * LANE_WIDTH
  }
  
  calcY(tick: number): number {
    return this.containerHeight - (MARGIN_BOTTOM + (tick / TICK_PER_MEASURE) * this.measureHeight)
  }

  calcRawLane(x: number): number {
    return (x - MARGIN) / LANE_WIDTH + 1
  }

  calcLane(x: number): number {
    return Math.floor(clamp(LANE_MIN, this.calcRawLane(x), LANE_MAX))
  }

  calcLaneSide(x: number): number {
    return Math.floor(clamp(LANE_MIN, this.calcRawLane(x), LANE_MAX + 1))
  }

  calcRawTick(y: number): number {
    const rawTick = (this.containerHeight - y - MARGIN_BOTTOM) / this.measureHeight * TICK_PER_MEASURE
    return Math.max(0, rawTick)
  }

  calcTick(y: number, scrollTick: number): number {
    return snap(this.calcRawTick(y) + scrollTick, TICK_PER_MEASURE / this.snapTo)
  }

  intersectRect(lane: number, width: number, tick: number, rect: IRect): boolean {
    const laneR = lane + width
    const top = this.calcRawTick(rect.top)
    const bottom = this.calcRawTick(rect.bottom)
    const left = this.calcRawLane(rect.left)
    const right = this.calcRawLane(rect.right)
    return lane < right && laneR > left && between(top, tick, bottom)
  }
}

export const position = writable<PositionManager>(null)

export type LaneTick = {
  lane: number,
  tick: number,
}

export type Point = {
  x: number,
  y: number
}

export const cursor = writable<LaneTick & { laneSide: number }>({ lane: 0, tick: 0, laneSide: 0 })
export const pointer = writable<Point>({ x: 0, y: 0 })
