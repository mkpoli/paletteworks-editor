

export const ALLOWED_SNAPPINGS = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192]
export type SnapTo = number

import select from '$assets/select.png'
import tap from '$assets/notes/noteN.png'
import slide from '$assets/notes/noteL.png'
import mid from '$assets/notes/notes_long_among.png'
import flick from '$assets/notes/notes_flick_arrow_01.png'
import critical from '$assets/notes/noteC.png'
import bpm from '$assets/BPM.png'
import timeSignature from '$assets/TimeSignature.png'

type ImageSource = string

export const MODES = ['select', 'tap', 'slide', 'mid', 'flick', 'critical', 'bpm', 'timeSignature'] as const

export type Mode = typeof MODES[number]

export const MODE_TEXTURES: Record<Mode, ImageSource> = {
  select,
  tap,
  slide,
  mid,
  flick,
  critical,
  bpm,
  timeSignature
}

export const MODE_FLOATING_TEXTURES: Record<string, string> = {
  tap: 'noteN.png',
  slide: 'noteL.png',
  mid: 'notes_long_among.png',
  flick: 'noteF.png',
  critical: 'noteC.png',
}

export const MODE_SHORTCUTS = {
  select: 'v',
  tap: 't',
  slide: 's',
  mid: 'r',
  flick: 'f',
  critical: 'c',
  bpm: 'b',
  timeSignature: 'm'
}

export const MODE_SHORTCUTS_NUMERAL = {
  select: '1',
  tap: '2',
  slide: '3',
  mid: '4',
  flick: '5',
  critical: '6',
  bpm: '7',
  timeSignature: '8'
}
