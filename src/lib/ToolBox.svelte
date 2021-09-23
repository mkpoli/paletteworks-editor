<script lang="ts">
  import Icon, { addIcon } from '@iconify/svelte'
  import bpmImage from '$assets/BPM.png'
  import selectImage from '$assets/select.png'
  import type { Mode } from '$libs/modes'


  type ImageSource = string
  const MODES: Record<Mode, ImageSource> = {
    select: selectImage,
    tap: 'noteN.png',
    slide: 'noteL.png',
    mid: 'notes_long_among.png',
    flick: 'noteF.png',
    critical: 'noteC.png',
    bpm: bpmImage,
  }

  export let currentMode: Mode

  addIcon('custom:logo', {
    body: `<path d="M258 29L472.609 243.609L256 337.821L256 335.486V74L72.2283 257.891L256 337.821V358L103.869 291.478L256 443.708L256 358L481.684 259.316L258 483L37.4242 262.424L31 256L42.1788 244.821L258 29Z" fill="currentColor"></path>`,
    width: 512,
    height: 512
  })

  function setMode(mode: string) {
    currentMode = mode as Mode
  }

  const ALLOWED_SNAPPING = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192]
</script>

<div class="toolbox-container">
  <div class="menu-container">
    <Icon icon="custom:logo" width=36 />
    PaletteWorks
    <Icon icon="ph:caret-down-fill" width=15 />
  </div>
  <div class="tool-container">
    {#each Object.entries(MODES) as [ mode, src ]}
      <button on:click={() => { setMode(mode) }} class:current={ currentMode === mode }>
        <img src={src} alt={`${mode} Mode`} />
      </button>
    {/each}
    <!-- <label>
      <input type="checkbox" />
      SNAP?
    </label> -->
    <select>
      {#each ALLOWED_SNAPPING as snap}
        <option value={snap}>{snap}分音符</option>
      {/each}
    </select>
  </div>
</div>

<style>
  .toolbox-container {
    display: grid;
    width: 15em;
    grid-template-rows: auto 1fr;
  }

  .menu-container {
    padding: 1em;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 800;
    gap: 1em;
    border-bottom: 2px solid #000;
  }

  .menu-container:hover {
    filter: brightness(1.5);
  }

  .tool-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1em;
    /* gap: 1em; */
  }

  img {
    height: 5em;
  }

  
  button {
    background: transparent;
    width: 100%;
    height: 6em;
    border-radius: 0;
    border: none;
    /* margin: 0; */
    padding: 0;
    border-bottom: 1px solid #fff3;
    /* border: 1px solid #fffa; */
  }

  button:focus,
  button.current {
    outline: none;
    filter: brightness(1.5);
  }

  select {
    font-size: 1.125em;
    padding: 0.25em 0.5em;
    border-radius: 1em;
    margin: 1em;
  }
</style>