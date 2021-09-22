<svelte:window
  on:wheel|preventDefault|nonpassive={mousewheel}
  on:keydown={keyboard}
/>

<script lang="ts">
  export let playhead: number
  export let zoom: number

  function mousewheel(event: WheelEvent) {
    if (event.ctrlKey) { 
      zoom -= (event.deltaY > 0 ? 0.1 : -0.1) * (event.shiftKey ? 10 : 1)
    } else {
      playhead -= event.deltaY * 1 * (event.shiftKey ? 5 : 1)
    }
  }


  function keyboard(e: KeyboardEvent) {
    if (e.key === ' ') {
      if (player.paused) {
        player.play()
      } else {
        player.pause()
      }
    }
  }  
</script>