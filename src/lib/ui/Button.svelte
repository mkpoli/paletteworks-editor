<script lang="ts">  
  import Icon from '@iconify/svelte'
  import Wrapper from '$lib/ui/Wrapper.svelte'
  import Tooltip from '$lib/ui/Tooltip.svelte'

  import type { Placement } from 'tippy.js'
  
  export let href: string | undefined = undefined
  export let icon: string | undefined = undefined
  export let disabled: boolean | undefined = undefined
  export let height: string | undefined = undefined
  export let width: string | undefined = undefined
  export let loading: boolean = false
  export let element: HTMLButtonElement | HTMLAnchorElement | undefined = undefined
  export let tooltip: {
    placement: Placement
    offset?: [number, number]
    description?: string
    keys?: Readonly<Readonly<string[]>[]> 
  } | undefined = undefined
</script>


<Wrapper
  component={Tooltip}
  wrap={tooltip !== undefined}
  {...tooltip}
>
  {#if href === undefined}
    <button on:click class={$$props.class} style={$$props.style} {disabled} bind:this={element}>
      {#if icon}
        {#if loading}
          <Icon icon="eos-icons:loading" height={height ?? "1em"} width={width ?? "1em"} class="loading" />
        {:else}
          <Icon icon={icon} height={height ?? "1em"} width={width ?? "1em"} />
        {/if}
      {/if}
      <slot/>
    </button>
  {:else}
    <a class={$$props.class} style={$$props.style} {href} class:disabled target="_blank" on:click bind:this={element}>
      {#if icon}
        {#if loading}
          <Icon icon="eos-icons:loading" height={height ?? "1em"} width={width ?? "1em"} class="loading" />
        {:else}
          <Icon icon={icon} height={height ?? "1em"} width={width ?? "1em"} />
        {/if}
      {/if}
      <slot/>
    </a>
  {/if}
</Wrapper>

<style>
  button, a {
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

  a {
    text-decoration: none;
  }

  button.text, a.text {
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

  button:hover:not([disabled]),
  a:hover:not(.disabled) {
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