<script lang="ts">
  import { hideAll } from 'tippy.js'
  import { createEventDispatcher } from "svelte"

  import Icon from "@iconify/svelte"
  import Button from "$lib/ui/Button.svelte"

  export let container: HTMLDivElement
  export let hasSubMenu: boolean

  export let icon: string
  export let text: string
  export let disabled: boolean

  $: shortcutKey = text.match(/&([A-Z])/)?.[1]

  let altPressed: boolean

  const dispatch = createEventDispatcher()

  function onclick() {
    if (!hasSubMenu) {
      hideAll()
    }
    dispatch('click')
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key == 'Alt') {
      altPressed = true
    }

    if (shortcutKey && event.altKey && shortcutKey.toLowerCase() === event.key ) {
      onclick()
    }
  }
  function onkeyup(event: KeyboardEvent) {
    if (event.key == 'Alt') {
      altPressed = false
    }
  }
  
</script>

<div
  class="menu-item"
  role="menuitem"
  bind:this={container}
>
  <Button
    {icon}
    {disabled}
    class="text"
    on:click={onclick}
  >
    <div>{@html text.replace(/&([A-Z])/, `<span style="text-decoration: ${altPressed ? 'underline' : 'none'};">$1</span>`)}</div>
    {#if hasSubMenu}
      <Icon icon="ic:round-chevron-right" width="1.5em" class="chevron" />
    {/if}
  </Button>
</div>

<svelte:window
  on:keydown={onkeydown}
  on:keyup={onkeyup}
/>

<style>
  .menu-item :global(button) {
    width: 100%;
    justify-content: left;
    border-radius: 0;
  }

  .menu-item :global(button:hover:not([disabled])) {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .menu-item :global(button[disabled]) {
    filter:
      blur(0.5px)
      brightness(.85);
    text-decoration: line-through;
  }

  .menu-item :global(.chevron) {
    /* justify-self: flex-end; */
    margin-left: auto;
    margin-right: -0.5em;
  }
</style>