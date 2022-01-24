<script lang="ts">
  // I18n
  import LL from '$i18n/i18n-svelte'

  // Types
  import type { Mode } from '$lib/editing/modes'

  // UI Components
  import Tooltip from '$lib/ui/Tooltip.svelte'

  // Constants
  import { MODE_SHORTCUTS, MODE_SHORTCUTS_NUMERAL, MODE_TEXTURES } from '$lib/editing/modes'

  // Props
  export let mode: Mode
  export let currentMode: Mode

  // Variables
  let button: HTMLButtonElement

  $: if (button && currentMode !== mode) {
    button.blur()
  }
</script>

<Tooltip
  placement="right"
  offset={[0, -15]}
  description={$LL.editor.modes[mode]()}
  class="tool-button"
  keys={[...MODE_SHORTCUTS_NUMERAL[mode], ...MODE_SHORTCUTS[mode]].map((key) => [key])}
>
  <button on:click={() => { currentMode = mode }} class:current={currentMode === mode} bind:this={button}>
    <img src={MODE_TEXTURES[mode]} alt={`${$LL.editor.modes[mode]()} Mode`} />
  </button>
</Tooltip>

<style>
  button {
    box-shadow: none;    
    background: transparent;
    width: 100%;
    height: 5em;
    border-radius: 0;
    border: none;
    padding: 0;
    border-bottom: 1px solid #fff3;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  button > :global(img) {
    transition: transform .2s;
  }

  button:focus {
    outline: none;
  }

  button:focus-visible {
    outline: 2px solid #fff;
  }

  button.current {
    filter: brightness(1.65);
  }

  button.current > :global(img) {
    transform: scale(1.25);
  }

  img {
    height: 5em;
  }

  :global(.tool-button) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
</style>