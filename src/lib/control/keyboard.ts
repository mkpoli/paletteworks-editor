export const KEYBOARD_SHORTCUTS  = {
  skipstart: [['backspace'], ['home'], ['shift', '`']],
  skipback: [['`'], ['\\']],
  playpause: [['space']],
  duplicate: [['ctrl', 'd']],
  flip: [['ctrl', 'h']],
  copy: [['ctrl', 'c']],
  cut: [['ctrl', 'x']],
  paste: [['ctrl', 'v']],
  flippaste: [['ctrl', 'alt', 'v']],
  undo: [['ctrl', 'z']],
  redo: [['ctrl', 'y'], ['ctrl', 'shift', 'z']],
  save: [['ctrl', 's']],
  export: [['ctrl', 'e'], ['ctrl', 'shift', 's']],
  open: [['ctrl', 'o']],
  image: [['ctrl', 'i']],
  new: [['ctrl', 'n']],
  selectall: [['ctrl', 'a']],
  delete: [['delete']],
  increaseSnapTo: [['alt', '=']],
  decreaseSnapTo: [['alt', '-']],
  pageup: [['pageup']],
  pagedown: [['pagedown']],
  gotoup: [['up']],
  gotodown: [['down']],
  gotoupfast: [['shift', 'up']],
  gotodownfast: [['shift', 'down']],
} as const

export type KeyboardAction = keyof typeof KEYBOARD_SHORTCUTS

import { writable } from 'svelte/store'

export const shiftKey = writable(false)
export const ctrlKey = writable(false)
export const altKey = writable(false)