<script lang="ts">
  import type { Note } from '$lib/score/beatmap'
  
  import { createEventDispatcher } from 'svelte'
  import { selectedNotes } from '$lib/editing/selection'
  const dispatch = createEventDispatcher<{
    deleteselection: void,
    copy: { notes: Note[] },
    cut: { notes: Note[] },
    paste: void,
    undo: void,
    redo: void
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
    if (event.key === ' ') {
      paused = !paused
    }
    
    if (event.key == 'Delete') {
      dispatch('deleteselection')
    }

    if (event.ctrlKey && event.key == 'c') {
      dispatch('copy', { notes: $selectedNotes })
    }

    if (event.ctrlKey && event.key == 'x') {
      dispatch('cut', { notes: $selectedNotes })
    }

    if (event.ctrlKey && event.key == 'v') {
      dispatch('paste')
    }

    if (event.ctrlKey && event.key == 'z') {
      dispatch('undo')
    }

    if (event.ctrlKey && event.key == 'y' || event.ctrlKey && event.shiftKey && event.key == 'z') {
      dispatch('redo')
    }
  }
</script>

<svelte:window
  on:wheel|preventDefault|nonpassive={mousewheel}
  on:keydown={keyboard}
/>
