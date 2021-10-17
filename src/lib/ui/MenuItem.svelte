<script lang="ts">
  import Menu from "./Menu.svelte";
  import MenuTrigger from "./MenuTrigger.svelte"
  import MenuItemButton from "./MenuItemButton.svelte"

  export let icon: string
  export let text: string
  export let disabled: boolean = false

  let container: HTMLDivElement

  const hasSubMenu: boolean = !!$$slots.default
  let subMenu: HTMLDivElement
</script>

{#if subMenu}
  <MenuTrigger menu={subMenu} sub={true}>
    <MenuItemButton 
      {icon}
      {text}
      {disabled}
      {hasSubMenu}
      bind:container
    />
  </MenuTrigger>
{:else}
  <MenuItemButton 
    {icon}
    {text}
    {disabled}
    {hasSubMenu}
    bind:container
  />
{/if}

{#if hasSubMenu}
  <Menu bind:menu={subMenu}>
    <slot/>
  </Menu>
{/if}
