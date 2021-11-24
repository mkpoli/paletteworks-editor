<script lang="ts">
  export let value: string | number
  export let inputElement: HTMLInputElement | undefined = undefined
  export let disabled: boolean = false
</script>

<div class={[$$props.class, "input-container"].join(' ')}>
  <slot name="head" />
  <input type="text" bind:value={value} bind:this={inputElement} on:keydown {disabled}>
  <slot name="tail"/>
  <slot name="action"></slot>
</div>

<style>
  .input-container {
    border: none;
    border-radius: var(--input-border-radius);
    color: inherit;
    padding: 0 1em;
    box-shadow: inset 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: rgba(255, 255, 255, 0.1);
    flex-grow: 1;
    overflow: hidden;
    display: flex;
    align-items: center;
  }

  .input-container:focus-within {
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
    outline: 1px solid #fff;
  }

  input {
    background: transparent;
    border: none;
    box-shadow: none;
    width: 100%;
    flex-grow: 1;
  }

  .input-container :global(*) {
    flex-grow: 0;
  }
  
  input:focus {
    outline: none
  }
</style>