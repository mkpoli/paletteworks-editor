export const KEYBOARD_SHORTCUTS  = {
  skipstart: [['backspace'], ['home'], ['shift', '`']],
  skipback: [['`'], ['\\']],
  playpause: [['space']],
  duplicate: [['ctrl', 'd']],
  flip: [['ctrl', 'h']],
  copy: [['ctrl', 'c']],
  cut: [['ctrl', 'x']],
  paste: [['ctrl', 'v']],
  undo: [['ctrl', 'z']],
  redo: [['ctrl', 'y'], ['ctrl', 'shift', 'z']],
  save: [['ctrl', 's']],
  export: [['ctrl', 'e'], ['ctrl', 'shift', 's']],
  open: [['ctrl', 'o']],
  new: [['ctrl', 'n']],
  selectall: [['ctrl', 'a']],
  delete: [['delete']],
} as const

export type KeyboardAction = keyof typeof KEYBOARD_SHORTCUTS
