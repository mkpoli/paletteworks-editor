<script lang="ts">  
  import Icon from '@iconify/svelte'
  
  import Button from '$lib/ui/Button.svelte'
  import Menu from '$lib/ui/Menu.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'  
  import Wrapper from '$lib/ui/Wrapper.svelte'
  
  export let icon: string
  export let text: string
  export let disabled: boolean = false
  export let checked: boolean = undefined
  
  let container: HTMLDivElement = null
  
  const hasSubMenu: boolean = !!$$slots.default
  let subMenu: HTMLDivElement

  $: shortcutKey = text.match(/&([A-Z])/)?.[1]
  
  let altPressed: boolean
  
  import { createEventDispatcher } from "svelte"
  const dispatch = createEventDispatcher()
  
  import { hideAll } from 'tippy.js'
  function onclick() {
    if (!hasSubMenu && checked === undefined) {
      hideAll()
    }
    dispatch('click')
  }

  function onkeydown(event: KeyboardEvent) {
    if (event.key == 'Alt') {
      altPressed = true
    }

    if (shortcutKey && event.altKey && shortcutKey.toLowerCase() === event.key) {
      event.preventDefault()
      onclick()
    }
  }
  function onkeyup(event: KeyboardEvent) {
    if (event.key == 'Alt') {
      altPressed = false
    }
  }
    
</script>

<Wrapper
  component={MenuTrigger}
  wrap={hasSubMenu}
  menu={subMenu}
  sub={true}
>
  <div
    class="menu-item"
    role="menuitem"
    bind:this={container}
  >
    <Button
      {icon}
      {disabled}
      class="text"
      on:click={onclick}
    >
      <div>{@html text.replace(/&([A-Z])/, `<span style="text-decoration: ${altPressed ? 'underline' : 'none'};">$1</span>`)}</div>
      {#if hasSubMenu}
        <Icon icon="ic:round-chevron-right" width="1.5em" class="chevron" />
      {/if}
      {#if checked !== undefined}
        {#if checked}
          <Icon icon="mdi:checkbox-marked-circle" width="1.5em" class="chevron" />
        {:else}
          <Icon icon="mdi:checkbox-blank-circle-outline" width="1.5em" class="chevron" />
        {/if}
      {/if}
    </Button>
  </div>
</Wrapper>

{#if hasSubMenu}
  <Menu bind:menu={subMenu}>
    <slot/>
  </Menu>
{/if}

<svelte:window
  on:keydown={onkeydown}
  on:keyup={onkeyup}
/>

<style>
  .menu-item :global(button) {
    width: 100%;
    justify-content: left;
    border-radius: 0;
  }

  .menu-item :global(button:hover:not([disabled])) {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .menu-item :global(button[disabled]) {
    filter:
      blur(0.5px)
      brightness(.85);
    text-decoration: line-through;
  }

  .menu-item :global(.chevron) {
    /* justify-self: flex-end; */
    margin-left: auto;
    margin-right: -0.5em;
  }
</style>