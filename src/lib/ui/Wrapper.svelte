<script lang="ts">
  import type { SvelteComponent } from 'svelte'
  export let component: typeof SvelteComponent
  export let wrap: boolean = true
</script>

{#if wrap}
  <svelte:component
    this={component}
    {...$$restProps}
  >
    <slot></slot>
  </svelte:component>
{:else}
  <slot></slot>
{/if}
