export type Mode = 'select' | 'tap' | 'slide' | 'mid' | 'flick' | 'critical' | 'bpm' 

export const ALLOWED_SNAPPINGS = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192] as const
export type SnapTo = typeof ALLOWED_SNAPPINGS[number]

export function snap(y: number, step: number) {
  return Math.floor(y / step) * step
}

import bpmImage from '$assets/BPM.png'
import selectImage from '$assets/select.png'
type ImageSource = string
export const MODE_TEXTURES: Record<Mode, ImageSource> = {
  select: selectImage,
  tap: 'noteN.png',
  slide: 'noteL.png',
  mid: 'notes_long_among.png',
  // flick: 'noteF.png',
  flick: 'notes_flick_arrow_01.png',
  critical: 'noteC.png',
  bpm: bpmImage,
}