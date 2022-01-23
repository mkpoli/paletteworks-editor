<script lang="ts">
  import { debugInfo } from '$lib/basic/debug'
  let hidden: boolean = false

  let debugDisplay: HTMLDivElement
  let offsetX: number = 0
  let offsetY: number = 0

  function movediv(event: PointerEvent) {
    const { clientX, clientY } = event
    debugDisplay.style.left = `${clientX - offsetX}px`
    debugDisplay.style.top = `${clientY - offsetY}px`
  }
</script>

<div
  class="debug-display" class:hidden
  on:dblclick={() => { hidden = true }}
  on:pointerdown={(e) => {
    if (e.button === 0) {
      const { left, top } = debugDisplay.getBoundingClientRect()
      offsetX = e.clientX - left
      offsetY = e.clientY - top
      window.addEventListener('pointermove', movediv)
    }
  }}
  on:pointerup={() => {
    window.removeEventListener('pointermove', movediv)
  }}
  bind:this={debugDisplay}
>
  {#each [...$debugInfo.entries()] as [title, value] }
    <span class="title" title={title}>{title}</span>
    <span class="value">{value}</span>
  {/each}
</div>

<style>
  .debug-display {
    position: absolute;
    top: 0;
    right: 0;
    padding: 1em 1.5em;
    color: black;
    font-size: 0.9em;
    background: rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
    box-shadow: 1px 1px 3px #000a;
    display: grid;
    grid-template-columns: auto 1fr;
    width: 30em;
    gap: 0 1em;
    white-space: pre;
    z-index: 10000;
  }

  .debug-display > .title {
    color: #222;
    font-weight: 800;
    max-width: 10em;
    overflow: hidden;
  }

  .hidden {
    display: none;
  }
</style>