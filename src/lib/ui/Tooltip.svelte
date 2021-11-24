<script lang="ts">
  import type { Placement } from 'tippy.js'

  import { onMount } from 'svelte'
  import tippy from 'tippy.js'

  export let placement: Placement
  export let offset: [number, number] = [0, 0]
  export let description: string | undefined = undefined

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

<div bind:this={target} class={$$props.class}>
  <slot/>
</div>
<div class="tooltip-container" bind:this={tooltip}>
  {#if description !== undefined}
    <span>{description}</span>
  {/if}
  <slot name="keys"/>
</div>

<style>
  .tooltip-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  :global(.tippy-box[data-theme~='tool']) {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(122deg, rgba(116, 80, 244, 0.65) 0%, rgba(255, 65, 169, 0.65) 100%);
    box-shadow: 0 3px 12px #402860;
    font-weight: bold;
    padding: 0.4em 0.5em;
    border-radius: 0.5em;
    backdrop-filter: blur(4px);
  }
</style>