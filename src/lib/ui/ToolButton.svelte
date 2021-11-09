<script lang="ts">
  // Types
  import type { Mode } from '$lib/editing/modes'

  // UI Components
  import Tooltip from '$lib/ui/Tooltip.svelte'
  import KeyboardShortcut from '$lib/ui/KeyboardShortcut.svelte'

  // Constants
  import { MODE_DESCRIPTIONS, MODE_SHORTCUTS, MODE_SHORTCUTS_NUMERAL, MODE_TEXTURES } from '$lib/editing/modes'

  // Props
  export let mode: Mode
  export let currentMode: Mode
</script>

<Tooltip
  placement="right"
  offset={[0, -15]}
  description={MODE_DESCRIPTIONS[mode]}
  class="tool-button"
>
  <button on:click={() => { currentMode = mode}} class:current={currentMode === mode}>
    <img src={MODE_TEXTURES[mode]} alt={`${MODE_DESCRIPTIONS[mode]} Mode`} />
  </button>
  <KeyboardShortcut slot="keys" keys={[MODE_SHORTCUTS_NUMERAL[mode], MODE_SHORTCUTS[mode]]}/>
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
  }

  button > :global(img) {
    transition: transform .2s;
  }

  button:focus,
  button.current {
    outline: none;
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