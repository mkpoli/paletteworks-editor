export { default as COLORS } from './colors'

export const RESOLUTION = 1

export const BEAT_UNIT = 4
export const BEAT_IN_MEASURE = 4
export const TICK_PER_BEAT = 480
export const TICK_PER_MEASURE = TICK_PER_BEAT * BEAT_IN_MEASURE

export const MARGIN = 100
export const MARGIN_BOTTOM = 30

export const TEXT_MARGIN = 20

export const LANE_WIDTH = 30
export const LANE_COUNT_REAL = 12
export const LANE_MIN = 2
export const LANE_MAX = 13
export const LANE_SUS_MIN = 0
export const LANE_SUS_MAX = 16
export const LANE_SIDE_MAX = LANE_MAX + 1
export const LANE_COUNT = LANE_COUNT_REAL + 2
export const LANE_FEVER = 15
export const LANE_SKILL = 0
export const MEASURE_HEIGHT = 300
export const TICK_HEIGHT = 0.15625
export const MAIN_WIDTH = MARGIN * 2 + 30 * LANE_COUNT
export const SCROLLBAR_WIDTH = 13
export const MINIMAP_RESOLUTION = 0.2
export const MINIMAP_WIDTH = MAIN_WIDTH * MINIMAP_RESOLUTION

export const WIDTH_DEFAULT = 3

export const SNAPTO_DEFAULT = 8

export const NOTE_PIVOT = [0.14971751412, 0.5]
export const NOTE_WIDTH = 43
export const NOTE_HEIGHT = 30

export const DIAMOND_PIVOT = [0.15189873417, 0.5]
export const DIAMOND_WIDTH = 30
export const DIAMOND_HEIGHT = 30 / 158 * 160

export const ZOOM_MIN = 0.1
export const ZOOM_MAX = 10.0
export const ZOOM_STEP = 0.1
export const ZOOM_DEFAULT = 1

export const TEXTURE_NAMES = [
  'noteC.png',
  'noteF.png',
  'noteL.png',
  'noteN.png',
  'notes_flick_arrow_01.png',
  'notes_flick_arrow_01_diagonal.png',
  'notes_flick_arrow_02.png',
  'notes_flick_arrow_02_diagonal.png',
  'notes_flick_arrow_03.png',
  'notes_flick_arrow_03_diagonal.png',
  'notes_flick_arrow_04.png',
  'notes_flick_arrow_04_diagonal.png',
  'notes_flick_arrow_05.png',
  'notes_flick_arrow_05_diagonal.png',
  'notes_flick_arrow_06.png',
  'notes_flick_arrow_06_diagonal.png',
  'notes_flick_arrow_crtcl_01.png',
  'notes_flick_arrow_crtcl_01_diagonal.png',
  'notes_flick_arrow_crtcl_02.png',
  'notes_flick_arrow_crtcl_02_diagonal.png',
  'notes_flick_arrow_crtcl_03.png',
  'notes_flick_arrow_crtcl_03_diagonal.png',
  'notes_flick_arrow_crtcl_04.png',
  'notes_flick_arrow_crtcl_04_diagonal.png',
  'notes_flick_arrow_crtcl_05.png',
  'notes_flick_arrow_crtcl_05_diagonal.png',
  'notes_flick_arrow_crtcl_06.png',
  'notes_flick_arrow_crtcl_06_diagonal.png',
  'notes_long_among.png',
  'notes_long_among_crtcl.png'
]

import tapPerfect from '$assets/sound/perfect.mp3'
import tapCritical from '$assets/sound/critical_tap.mp3'
import flickCritical from '$assets/sound/critical_flick.mp3'
import flick from '$assets/sound/flick.mp3'
import tick from '$assets/sound/tick.mp3'
import tickCritical from '$assets/sound/critical_tick.mp3'
import connect from '$assets/sound/connect.mp3'
import connectCritical from '$assets/sound/connect_critical.mp3'
import stage from '$assets/sound/stage.mp3'

export const EFFECT_SOUNDS = {
  tapPerfect,
  tapCritical,
  flick,
  flickCritical,
  tick,
  tickCritical,
  connect,
  connectCritical,
  stage
}

/**
 * Z-indicies
 **/
export enum Z_INDEX {
  GRID,
  BAR,
  GAMESCRIPT,
  FLOATING_BAR,
  PLAYHEAD,
  SLIDE_PATH,
  STEP,
  DIAMOND,
  NOTE,
  ARROW,
  CONTROL,
  CONTROL_INTERACTION,
  MINIMAP,
  ERROR,
  SELECTION,
  FLOATING_SLIDE_PATH,
  FLOATING_STEP,
  FLOATING_DIAMOND,
  FLOATING_NOTE,
  FLOATING_ARROW,
}