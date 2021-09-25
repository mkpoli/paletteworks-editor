<script type="ts">
  import Icon from '@iconify/svelte'

  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let attrs: {
    icon: string
    height?: string
    width?: string
  }
</script>

<button on:click={() => {dispatch('click')}}>
  <Icon {...attrs} />
</button>

<style>
  button {
    appearance: none;
    background: transparent;
    border: none;
    color: inherit;
    box-shadow: none;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button:hover {
    filter: brightness(1.5);
  }
</style>
