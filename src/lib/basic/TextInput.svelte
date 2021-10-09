<script lang="ts">
  export let value: string
  export let inputElement: HTMLInputElement
</script>

<div class="input-container">
  <slot name="head" />
  <input type="text" name="bpm" bind:value={value} bind:this={inputElement} on:keydown>
  <slot name="tail"/>
</div>

<style>
  .input-container {
    border: none;
    border-radius: 5px;
    color: inherit;
    padding: 0.5em 1em;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.1);

    display: flex;
    align-items: center;
  }

  .input-container:focus-within {
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
  }

  input {
    background: transparent;
    border: none;
    box-shadow: none;

    flex-grow: 1;
  }
  
  input:focus {
    outline: none
  }
</style>