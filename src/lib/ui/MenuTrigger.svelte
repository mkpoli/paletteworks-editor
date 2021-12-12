<script lang="ts">
  // Functions
  import tippy from 'tippy.js'
  import { createEventDispatcher, onMount } from 'svelte'

  // Types
  import type { Instance as TippyInstance } from 'tippy.js'

  export let menu: HTMLDivElement

  // Variables
  let instance: TippyInstance

  export let contextArea: HTMLElement | undefined = undefined
  export let sub: boolean = false

  const dispatch = createEventDispatcher<{
    contextmenu: void,
    hidden: void
  }>()

  let trigger: HTMLButtonElement
  onMount(() => {
    if (!contextArea) {
      // Normal Menu
      instance = tippy(trigger, {
        trigger: 'click focus',
        interactive: true,
        role: 'menu',
        placement: !sub ? 'top' : 'right-start',
        offset: [-4, 5],
        delay: [0, 0]
      })
    }
  })

  $: if (menu && instance) {
    instance.setContent(menu)
  }

  $: if (contextArea) {
    // Context Menu
    instance = tippy(contextArea, {
      placement: 'right-start',
      trigger: 'manual',
      interactive: true,
      offset: [0, 0],
      delay: [0, 0],
      onHide() {
        dispatch('hidden')
      }
    })

    contextArea.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault()

      dispatch('contextmenu')

      if (menu.childElementCount < 1) {
        return
      }

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