<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Mode, MODES, MODE_SHORTCUTS, MODE_SHORTCUTS_NUMERAL } from '$lib/editing/modes'
  import { KEYBOARD_SHORTCUTS } from './consts'
  import type { KeyboardAction } from '$lib/consts'

  // Stores
  import { inside } from '$lib/position'

  type KeyboardEvents = {
    [K in KeyboardAction]: void
  }

  const dispatch = createEventDispatcher<{
    switch: Mode,
  } & KeyboardEvents>()

  export let zoom: number
  export let scrollTick: number
  function mousewheel(event: WheelEvent) {
    if (!$inside) return
    event.preventDefault()
    if (event.ctrlKey) { 
      zoom -= (event.deltaY > 0 ? 0.1 : -0.1) * (event.shiftKey ? 10 : 1)
    } else {
      scrollTick -= event.deltaY * 1.5 * (event.shiftKey ? 5 : 1)
    }
  }

  function onkeydown(event: KeyboardEvent) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return

    let target: KeyboardAction
    const hasTarget = Object.entries(KEYBOARD_SHORTCUTS).some(([action, keyCombinations]) => {
      return keyCombinations.some((keyCombination: string | readonly string[]) => {
        if (keyCombination instanceof Array) {
          for (let key of keyCombination) {
            switch (key) {
              case 'Control':
                if (!event.ctrlKey) return false
                break
              case 'Shift':
                if (!event.shiftKey) return false
                break
              case 'Alt':
                if (!event.altKey) return false
                break
              default:
                if (event.code !== key) return false
                break
            }
          }
        } else {
          const key = keyCombination
          if (event.key !== key || event.altKey || event.ctrlKey || event.shiftKey) return false
        }
        target = action as KeyboardAction
        return true
      })
    })
    if (hasTarget) {
      event.preventDefault()
      dispatch(target as KeyboardAction)
      return
    }
    
    for (let mode of MODES) {
      if (event.key === MODE_SHORTCUTS[mode] || event.key === MODE_SHORTCUTS_NUMERAL[mode]) {
        dispatch('switch', mode)
        event.preventDefault()
      }
    }      
  }
</script>

<svelte:window
  on:wheel|nonpassive={mousewheel}
  on:keydown={onkeydown}
/>
