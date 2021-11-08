<script lang="ts">
  import tippy from 'tippy.js'
  import { onMount } from 'svelte'

  export let current: boolean

  let button: HTMLButtonElement
  let tooltip: HTMLDivElement
  onMount(() => {
    const instance = tippy(button, {
      content: tooltip,
      placement: 'right',
      arrow: true,
      allowHTML: true,
      offset: [0, -15],
      delay: [500, 0],
      animation: 'fade',
      theme: 'tool',
    })
    return () => {
      instance.destroy()
    }
  })

</script>

<button on:click class:current bind:this={button}>
  <slot/>
</button>
<div bind:this={tooltip}>
  <slot name="tooltip"/>
</div>

<style>
  button {
    box-shadow: none;    
    background: transparent;
    width: 100%;
    height: 5em;
    border-radius: 0;
    border: none;
    /* margin: 0; */
    padding: 0;
    border-bottom: 1px solid #fff3;
    /* border: 1px solid #fffa; */
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