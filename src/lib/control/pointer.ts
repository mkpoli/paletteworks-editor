export const MOUSE_BUTTON = {
  LEFT: 0,
  MIDDLE: 1,
  RIGHT: 2,
}

import moveCursor from '$assets/cursor/move-cursor.png'
import resizeCursor from '$assets/cursor/resize-cursor.png'
import selectCursor from '$assets/cursor/select-cursor.png'
import grabCursor from '$assets/cursor/grab-cursor.png'

export const CURSOR_STYLES = {
  move: `url(${moveCursor}) 16 16, move`,
  resize: `url(${resizeCursor}) 16 16, ew-resize`,
  select: `url(${selectCursor}) 6 4, default`,
  grab: `url(${grabCursor}) 16 16, default`,
}