<script lang="ts">
  import type { Placement } from 'tippy.js'

  import { onMount } from 'svelte'
  import tippy from 'tippy.js'

  export let placement: Placement
  export let offset: [number, number] = [0, 0]
  export let description: string

  let target: HTMLDivElement
  let tooltip: HTMLDivElement
  onMount(() => {
    const instance = tippy(target, {
      content: tooltip,
      placement,
      arrow: true,
      allowHTML: true,
      offset,
      delay: [500, 0],
      animation: 'fade',
      theme: 'tool',
    })
    return () => {
      instance.destroy()
    }
  })
</script>

<div bind:this={target}>
  <slot/>
</div>
<div class="tooltip-container" bind:this={tooltip}>
  <span>{description}</span>
  <slot name="keys"/>
</div>

<style>
  .tooltip-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }
</style>