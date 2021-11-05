export type Mode = 'select' | 'tap' | 'slide' | 'mid' | 'flick' | 'critical' | 'bpm' 

export const ALLOWED_SNAPPINGS = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192] as const
export type SnapTo = typeof ALLOWED_SNAPPINGS[number]

import bpm from '$assets/BPM.png'
import select from '$assets/select.png'
import tap from '$assets/notes/noteN.png'
import slide from '$assets/notes/noteL.png'
import mid from '$assets/notes/notes_long_among.png'
import flick from '$assets/notes/noteL.png'
import critical from '$assets/notes/noteC.png'
type ImageSource = string
export const MODE_TEXTURES: Record<Mode, ImageSource> = {
  select,
  tap,
  slide,
  mid,
  flick,
  critical,
  bpm,
}

export const MODE_FLOATING_TEXTURES: Record<string, string> = {
  tap: 'noteN.png',
  slide: 'noteL.png',
  mid: 'notes_long_among.png',
  flick: 'noteF.png',
  critical: 'noteC.png',
}