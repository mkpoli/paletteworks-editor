<script lang="ts">
  import ClickableIcon from "./basic/ClickableIcon.svelte";

  export let zoom: number
  export let min: number
  export let max: number
  export let step: number

  const ICON_HEIGHT = '2em'
</script>

<div class="zoom-indicator" title="Zoom">
  <ClickableIcon
    icon="system-uicons:zoom-in"
    height={ICON_HEIGHT}
    on:click={() => { if (zoom <= max + step)  zoom += step }}
  />
  <div class="zoom-range-container">
    <input type="range" bind:value={zoom} min={min} max={max} step={step}>
  </div>
  <ClickableIcon
    icon="system-uicons:zoom-out"
    height={ICON_HEIGHT}
    on:click={() => { if (zoom >= min + step)  zoom -= step }}
  />
  <div class="zoom-number">
    {zoom.toFixed(1)}x
  </div>
</div>

<style>
  .zoom-indicator {
    color: #aaaaaa;

    display: grid;
    grid-template-rows: auto 1fr auto;
    justify-items: center;
    align-items: center;
  }

  .zoom-number {
    display: flex;
    font-size: 1em;
    width: 2em;
    align-items: center;
    justify-content: center;
  }

  .zoom-indicator:focus-within .zoom-number {
    color: #eeeeee;
  }

  .zoom-range-container {
    width: 2em;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .zoom-range-container:focus-within {
    border-radius: 5px;
    box-shadow: 0 0 0 1px  #FFFFFF;
  }

  input {
    margin-bottom: 5%;
    transform: rotate(270deg);
    height: 10em;
    width: 10em;
    min-width: 10em;
    position: relative;
  }

  input:focus {
    outline: none;
  }

  input:focus::before {
    content: '';
    height: 100%;
    width: 50%;
    background: white;

    outline: 1px solid #fff;
    filter: drop-shadow(0 0 3px #fff);
  }
</style>