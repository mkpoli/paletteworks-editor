export const BEAT_UNIT = 4
export const BEAT_IN_MEASURE = 4
export const TICK_PER_BEAT = 480
export const TICK_PER_MEASURE = TICK_PER_BEAT * BEAT_IN_MEASURE

export const MARGIN = 80
export const MARGIN_BOTTOM = 30

export const TEXT_MARGIN = -15

export const LANE_WIDTH = 30
export const LANE_COUNT = 16
export const LANE_AREA_WIDTH = LANE_WIDTH * LANE_COUNT
export const BAR_LENGTH = 500
export const CANVAS_WIDTH = MARGIN * 2 + LANE_AREA_WIDTH

export const NOTE_PIVOT = [0.14971751412, 0.5]
export const NOTE_WIDTH = 43
export const NOTE_HEIGHT = 60

export const DIAMOND_PIVOT = [0.15189873417, 0.5]
export const DIAMOND_WIDTH = 30
export const DIAMOND_HEIGHT = 30 / 158 * 160

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

export const FONT_FAMILY = 'Montserrat'
