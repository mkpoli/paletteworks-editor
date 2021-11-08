<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Mode, MODES, MODE_SHORTCUTS } from '$lib/editing/modes'
  const dispatch = createEventDispatcher<{
    delete: void,
    copy: void,
    cut: void,
    paste: void,
    undo: void,
    redo: void,
    save: void,
    open: void,
    new: void,
    switch: Mode,
    back: void,
  }>()

  export let zoom: number
  export let paused: boolean
  export let scrollTick: number
  function mousewheel(event: WheelEvent) {
    if (event.ctrlKey) { 
      zoom -= (event.deltaY > 0 ? 0.1 : -0.1) * (event.shiftKey ? 10 : 1)
    } else {
      scrollTick -= event.deltaY * 1.5 * (event.shiftKey ? 5 : 1)
    }
  }

  function keyboard(event: KeyboardEvent) {
    if (document.activeElement && document.activeElement.tagName === 'INPUT') return

    if (event.key === ' ') {
      event.preventDefault()
      paused = !paused
    }
    
    if (event.key == 'Delete') {
      dispatch('delete')
      event.preventDefault()
    }

    if (event.ctrlKey && event.key == 'c') {
      dispatch('copy')
      event.preventDefault()
    }

    if (event.ctrlKey && event.key == 'x') {
      dispatch('cut')
      event.preventDefault()
    }

    if (event.ctrlKey && event.key == 'v') {
      dispatch('paste')
      event.preventDefault()
    }

    if (event.ctrlKey && event.key == 'z') {
      dispatch('undo')
      event.preventDefault()
    }

    if (event.ctrlKey && event.key == 'y' || event.ctrlKey && event.shiftKey && event.key == 'z') {
      dispatch('redo')
      event.preventDefault()
    }
    
    if (event.ctrlKey && event.key == 's') {
      dispatch('save')
      event.preventDefault()
    }

    if (event.ctrlKey && event.key == 'o') {
      dispatch('open')
      event.preventDefault()
    }

    if (event.ctrlKey && event.key == 'n') {
      dispatch('new')
      event.preventDefault()
    }

    for (let mode of MODES) {
      if (event.key === MODE_SHORTCUTS[mode] || event.key === 'SHORTCUTS') {
        dispatch('switch', mode)
        event.preventDefault()
      }
    }

    if (event.key === 'Backspace' || event.key === '`') {
      dispatch('back')
      event.preventDefault()
    }
  }
</script>

<svelte:window
  on:wheel|preventDefault|nonpassive={mousewheel}
  on:keydown={keyboard}
/>
