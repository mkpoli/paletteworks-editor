<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import {
    Mode,
    MODES,
    MODE_SHORTCUTS,
    MODE_SHORTCUTS_NUMERAL,
  } from '$lib/editing/modes'
  import { KEYBOARD_SHORTCUTS } from '$lib/control/keyboard'

  import type { KeyboardAction } from '$lib/control/keyboard'

  // Stores
  import { inside } from '$lib/position'
  import { preferences } from '$lib/preferences'

  type KeyboardEvents = {
    [K in KeyboardAction]: void
  }

  const dispatch = createEventDispatcher<
    {
      switch: Mode
    } & KeyboardEvents
  >()

  export let zoom: number
  export let scrollTick: number

  function mousewheel(event: WheelEvent) {
    if (!$inside) return
    event.preventDefault()
    if (event.ctrlKey) {
      zoom -= (event.deltaY > 0 ? 0.1 : -0.1) * (event.shiftKey ? 10 : 1)
    } else {
      scrollTick -=
        (event.deltaY *
          (event.deltaMode === event.DOM_DELTA_PIXEL ? 1.5 : 35) *
          (event.shiftKey ? 5 : 1) *
          $preferences.scrollSpeed) /
        zoom
    }
  }

  // Keyboard Handling
  import hotkeys from 'hotkeys-js'
  Object.entries(KEYBOARD_SHORTCUTS).forEach(([action, keyCombinations]) => {
    hotkeys(
      keyCombinations
        .map((keyCombination) => keyCombination.join('+'))
        .join(','),
      (event) => {
        if (
          document.activeElement &&
          document.activeElement.tagName === 'INPUT'
        )
          return

        event.preventDefault()
        dispatch(action as KeyboardAction)
      }
    )
  })

  for (let mode of MODES) {
    hotkeys(
      `${MODE_SHORTCUTS[mode]},${MODE_SHORTCUTS_NUMERAL[mode]},num_${MODE_SHORTCUTS_NUMERAL[mode]}`,
      (event) => {
        event.preventDefault()
        dispatch('switch', mode)
      }
    )
  }
</script>

<svelte:window on:wheel|nonpassive={mousewheel} />
