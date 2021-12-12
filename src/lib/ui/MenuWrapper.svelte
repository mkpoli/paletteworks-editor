<script lang="ts">
  import Menu from './Menu.svelte'
  import MenuTrigger from './MenuTrigger.svelte'
  export let wrap: boolean
  export let menu: HTMLDivElement
</script>

{#if wrap}
  <Menu 
    bind:menu
    {...$$props}
  >
    <svelte:fragment slot="trigger">
      <MenuTrigger
        {menu}
        sub={true}
      >
        <slot />
      </MenuTrigger>
    </svelte:fragment>
    <slot name="menu" />
  </Menu>
{:else}
  <slot />
{/if}