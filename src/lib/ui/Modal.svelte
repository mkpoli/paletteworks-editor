<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte'
  const dispatch = createEventDispatcher<{
    opened: void,
    closed: void,
  }>()

  export let opened: boolean
  $: if (opened) {
    tick().then(() => {
      dispatch('opened')
    })
  } else {
    tick().then(() => {
      dispatch('closed')
    })
  }
</script>

<div class="modal-container" class:hidden={!opened}>
  <div class="modal-overlay" aria-hidden={true} on:click={() => { opened = false }}></div>
  <div class="modal-dialog">
    {#if opened}
      <slot name="presentation"></slot>
    {/if}
  </div>
</div>

<slot name="activator"></slot>

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