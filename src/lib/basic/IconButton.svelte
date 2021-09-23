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
    padding: 0;
  }

  button:hover {
    filter: brightness(1.5);
  }
</style>
