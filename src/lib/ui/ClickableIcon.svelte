<script type="ts">
  import Icon from '@iconify/svelte'

  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let icon: string
  export let height: string = undefined
  export let width: string = undefined

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault()
    }
  }
</script>

<button on:click on:keydown={handleKeydown}>
  <Icon icon={icon} height={height} width={width} />
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
