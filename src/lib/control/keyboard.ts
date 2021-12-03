export const KEYBOARD_SHORTCUTS  = {
  skipstart: ['Backspace', 'Home', ['Shift', 'Backquote']],
  skipback: ['`', '\\'],
  playpause: [' '],
  duplicate: [['Control', 'KeyD']],
  flip: [['Control', 'KeyH']],
  copy: [['Control', 'KeyC']],
  cut: [['Control', 'KeyX']],
  paste: [['Control', 'KeyV']],
  undo: [['Control', 'KeyZ']],
  redo: [['Control', 'KeyY'], ['Shift', 'Control', 'KeyZ']],
  save: [['Control', 'KeyS']],
  open: [['Control', 'KeyO']],
  new: [['Control', 'KeyN']],
  selectall: [['Control', 'KeyA']],
  delete: ['Delete'],
} as const

export type KeyboardAction = keyof typeof KEYBOARD_SHORTCUTS
