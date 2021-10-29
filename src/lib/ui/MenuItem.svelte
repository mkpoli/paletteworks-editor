<script lang="ts">
  import Menu from "./Menu.svelte";
  import MenuTrigger from "./MenuTrigger.svelte"
  import MenuItemButton from "./MenuItemButton.svelte"

  import Wrapper from "./Wrapper.svelte"

  export let icon: string
  export let text: string
  export let disabled: boolean = false

  let container: HTMLDivElement = null

  const hasSubMenu: boolean = !!$$slots.default
  let subMenu: HTMLDivElement
</script>

<Wrapper
  component={MenuTrigger}
  wrap={hasSubMenu}
  menu={subMenu}
  sub={true}
>
  <MenuItemButton 
    {icon}
    {text}
    {disabled}
    {hasSubMenu}
    bind:container
    on:click
  />
  </Wrapper>

{#if hasSubMenu}
  <Menu bind:menu={subMenu}>
    <slot/>
  </Menu>
{/if}
