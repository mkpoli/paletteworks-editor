<script type="ts">
  import Icon from '@iconify/svelte'

  export let icon: string
  export let height: string | undefined = undefined
  export let width: string | undefined = undefined
  export let href: string | undefined = undefined

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault()
    }
  }
</script>

{#if href}
  <a {href} target="_blank">
    <Icon icon={icon} height={height} width={width} />
  </a>
{:else}
  <button on:click on:keydown={handleKeydown}>
    <Icon icon={icon} height={height} width={width} />
  </button>
{/if}

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
