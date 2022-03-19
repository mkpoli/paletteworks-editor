import '$lib/basic/collections'
import { FLICK_TYPES } from '$lib/score/beatmap'

import type { Flick } from '$lib/score/beatmap'

export function rotateFlick(flick: Flick): Flick {
  return FLICK_TYPES.rotateNext(flick)
}

export function flipFlick(flick: Flick): Flick {
  switch (flick) {
    case 'left':
      return 'right'
    case 'right':
      return 'left'
    case 'middle':
      return 'middle'
    case 'no':
      return 'no'
  }
}
