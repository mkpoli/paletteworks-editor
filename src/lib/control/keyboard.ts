export const KEYBOARD_SHORTCUTS  = {
  skipstart: [['backspace'], ['home'], ['shift', '`']],
  skipback: [['`'], ['\\']],
  playpause: [['space']],
  duplicate: [['ctrl', 'd']],
  flip: [['ctrl', 'h'], ['shift', 'h']],
  vflip: [['shift', 'v']],
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
  unselectall: [['ctrl', 'shift', 'a']],
  delete: [['delete']],
  increaseSnapTo: [['alt', '=']],
  decreaseSnapTo: [['alt', '-']],
  pageup: [['pageup']],
  pagedown: [['pagedown']],
  gotoup: [['up']],
  gotodown: [['down']],
  gotoupfast: [['shift', 'up']],
  gotodownfast: [['shift', 'down']],
  openmainmenu: [['ctrl', 'm']],
} as const

export type KeyboardAction = keyof typeof KEYBOARD_SHORTCUTS

import { writable } from 'svelte/store'

export const shiftKey = writable(false)
export const ctrlKey = writable(false)
export const altKey = writable(false)