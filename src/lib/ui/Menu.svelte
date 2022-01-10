<script lang="ts" context="module">
  export type MenuInfo = {
    opened: boolean,
    submenuOpened: boolean,
    items: {
      element: HTMLButtonElement | HTMLAnchorElement,
      hasSubMenu: boolean,
    }[]
  }
</script>

<script lang="ts">
  export let menu: HTMLDivElement | undefined = undefined
  import { setContext } from 'svelte'
  const menuInfo: MenuInfo = {
    opened: false,
    submenuOpened: false,
    items: []
  }
  setContext<MenuInfo>('menu-info', menuInfo)
</script>

<slot name="trigger"></slot>
<div class="menu-container" style={$$props.style} bind:this={menu}>
  <slot></slot>
</div>

<style>
  .menu-container {
    padding: 0.25em 0;

    background: rgba(67, 71, 88, 0.8);
    backdrop-filter: blur(19px) saturate(200%);
    border-radius: 0.4em;
    box-shadow: 2px 2px 4px 0 #000;

    overflow: hidden;
  }
</style>