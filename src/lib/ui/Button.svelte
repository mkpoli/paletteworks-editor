<script lang="ts">
  import Icon from '@iconify/svelte'

  export let icon: string | undefined = undefined
  export let disabled: boolean = false
  export let height: string | undefined = undefined
  export let width: string | undefined = undefined
  export let loading: boolean = false
</script>

<button on:click class={$$props.class} {disabled}>
  {#if icon}
    {#if loading}
      <Icon icon="eos-icons:loading" height={height ?? "1em"} width={width ?? "1em"} class="loading" />
    {:else}
      <Icon icon={icon} height={height ?? "1em"} width={width ?? "1em"} />
    {/if}
  {/if}
  <slot/>
</button>

<style>
  button {
    appearance: none;
    border: none;
    border-radius: var(--input-border-radius);
    color: inherit;
    padding: var(--input-padding);
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

  button.action {
    border-radius: 0;
    box-shadow: none;
    height: 100%;
    margin-right: -1rem;
  }

  button.action > :global(svg) {
    font-size: 1.5em;
  }

  button:hover:not([disabled]) {
    filter: brightness(1.2);
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>