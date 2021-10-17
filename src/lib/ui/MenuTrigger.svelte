<script lang="ts">
  import { onMount } from 'svelte';

  import type { Instance as TippyInstance } from 'tippy.js'
  import tippy from 'tippy.js'

  export let menu: HTMLDivElement
  
  let instance: TippyInstance

  export let contextArea: HTMLElement = null
  export let sub: boolean = false

  let trigger: HTMLButtonElement
  onMount(() => {
    if (!contextArea) {
      // Normal Menu
      instance = tippy(trigger, {
        trigger: 'click focus',
        interactive: true,
        role: 'menu',
        placement: !sub ? 'top' : 'right-start',
        offset: [-4, 5]
      })
    }
  })

  $: menu && instance?.setContent(menu)

  $: if (contextArea) {
    // Context Menu
    instance = tippy(contextArea, {
      placement: 'right-start',
      trigger: 'manual',
      interactive: true,
      offset: [0, 0]
    })

    contextArea.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault()

      const mouseRect = new DOMRect(event.clientX, event.clientY, 0, 0)
      instance.setProps({
        getReferenceClientRect: () => mouseRect
      })

      instance.show()
    })
  }
</script>

{#if !contextArea}
  <button bind:this={trigger} class={$$props.class}>
    <slot/>
  </button>
{/if}

<style>
  button {
    appearance: none;
    background: none;
    border: none;
    color: inherit;
    padding: 0;
    width: 100%;
  }
</style>