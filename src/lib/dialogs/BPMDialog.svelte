<script lang="ts">
  import Modal from "$lib/basic/Modal.svelte"
  import { createEventDispatcher } from "svelte";
  export let opened: boolean
  export let value: number
  $: value = Number.parseFloat(valueString)
  let valueString: string
  const dispatch = createEventDispatcher()
</script>

<Modal bind:opened>
  <template slot="activator">
    
  </template>
  <div slot="presentation">
    <input type="text" name="bpm" bind:value={valueString}>
    <label for="bpm"> BPM</label>
    <button on:click={() => { dispatch('ok'); opened = false }} class="ok">OK</button>
    <button on:click={() => { dispatch('delete'); opened = false }} class="delete">Delete</button>
    <button on:click={() => { dispatch('cancel'); opened = false }} class="cancel">Close</button>
  </div>
</Modal>

<style>
  [slot=presentation] {
    padding: 1em;
    display: grid;
    gap: 1em;
    /* grid-template: 1fr auto / auto 1fr auto ; */
    grid-template-areas: 
      "t t t l"
      "o d 0 c";
  }

  input {
    grid-area: t;
  }

  label {
    grid-area: l;
  }

  .ok {
    grid-area: o;
  }

  .cancel {
    grid-area: c;
  }
</style>