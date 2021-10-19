import { clamp, snap } from "./basic/math"
import {
  LANE_MAX,
  LANE_MIN,
  LANE_WIDTH,
  MARGIN,
  MARGIN_BOTTOM,
  MEASURE_HEIGHT,
  SNAPTO_DEFAULT,
  TICK_PER_MEASURE,
} from "./consts"

export class PositionManager {
  measureHeight = MEASURE_HEIGHT
  scrollTick = 0
  snapTo = SNAPTO_DEFAULT

  calcLane(x: number): number {
    return Math.floor(clamp(LANE_MIN, (x - MARGIN) / LANE_WIDTH + 1, LANE_MAX))
  }

  calcTick(y: number): number {
    const rawTick = TICK_PER_MEASURE * (innerHeight - y - MARGIN_BOTTOM) / this.measureHeight
    return snap(rawTick + this.scrollTick, TICK_PER_MEASURE / this.snapTo)
  }
}