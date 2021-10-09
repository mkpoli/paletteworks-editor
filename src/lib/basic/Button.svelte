<script lang="ts">
  import Icon from '@iconify/svelte'

  export let icon: string = null
</script>

<button on:click class={$$props.class}>
  {#if icon}
    <Icon icon={icon} height="1em" />
  {/if}
  <slot/>
</button>

<style>
  button {
    appearance: none;
    border: none;
    border-radius: 5px;
    color: inherit;
    padding: 0.5em 1em;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
    background: #153982;

    display: flex;
    gap: 0.5em;
    align-items: center;
    justify-content: center;

    font-weight: bold;
  }

  button.text {
    box-shadow: none;
    border: none;
    background: transparent;
  }

  button:hover {
    filter: brightness(1.2);
  }
</style>