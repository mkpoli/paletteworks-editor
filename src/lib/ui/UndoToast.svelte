<script lang="ts">
  import Button from '$lib/ui/Button.svelte'

  export let text: string
  export let button: string
  export let undo: () => void

  let clicked: boolean = false
</script>

<div class:clicked={clicked}>
  {text}
  <Button on:click={() => { undo(); clicked = true}} class="text" disabled={clicked}>
    {button}
  </Button>
</div>

<style>
  div {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  div > :global(.text) {
    color: #0282c3;
  }

  div.clicked > :global(.text) {
    color: #aaaaaa;
  }
</style>