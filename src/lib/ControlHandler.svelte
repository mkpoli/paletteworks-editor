<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Mode } from '$lib/editing/modes'
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
    switch: Mode
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

    if (event.key == '1' || event.key == 'v') {
      dispatch('switch', 'select')
      event.preventDefault()
    }
    if (event.key == '2' || event.key == 't') {
      dispatch('switch', 'tap')
      event.preventDefault()
    }
    if (event.key == '3' || event.key == 's') {
      dispatch('switch', 'slide')
      event.preventDefault()
    }
    if (event.key == '4' || event.key == 'r') {
      dispatch('switch', 'mid')
      event.preventDefault()
    }
    if (event.key == '5' || event.key == 'f') {
      dispatch('switch', 'flick')
      event.preventDefault()
    }
    if (event.key == '6' || event.key == 'c') {
      dispatch('switch', 'critical')
      event.preventDefault()
    }
    if (event.key == '7' || event.key == 'b') {
      dispatch('switch', 'bpm')
      event.preventDefault()
    }
  }
</script>

<svelte:window
  on:wheel|preventDefault|nonpassive={mousewheel}
  on:keydown={keyboard}
/>
