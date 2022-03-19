<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte'
  const dispatch = createEventDispatcher<{
    opened: void
    closed: void
  }>()

  import * as focusTrap from 'focus-trap'

  import type { FocusTrap } from 'focus-trap'

  import hotkeys from 'hotkeys-js'
  hotkeys('esc', () => {
    opened = false
  })

  export let opened: boolean
  $: if (opened) {
    tick().then(() => {
      dispatch('opened')
      trap?.activate()
    })
  } else {
    tick().then(() => {
      dispatch('closed')
      trap?.deactivate()
    })
  }

  let container: HTMLDivElement
  let trap: FocusTrap
  onMount(() => {
    trap = focusTrap.createFocusTrap(container, {
      fallbackFocus: container,
      clickOutsideDeactivates: true,
    })
  })
</script>

<div
  class="modal-container"
  class:hidden={!opened}
  bind:this={container}
  tabindex="-1"
>
  <div
    class="modal-overlay"
    aria-hidden={true}
    on:click={() => {
      opened = false
    }}
  />
  <div class="modal-dialog">
    {#if opened}
      <slot name="presentation" />
    {/if}
  </div>
</div>

<slot name="activator" />

<style>
  .modal-container {
    display: grid;
    place-content: center;
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 9999;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: -1;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }

  .modal-dialog {
    padding: 1em 1.5em;
    background: var(--color-background-main);
    border-radius: 1em;
    box-shadow: 1px 1px 10px 5px rgba(0, 0, 0, 0.5);
  }

  .hidden {
    display: none;
  }
</style>
