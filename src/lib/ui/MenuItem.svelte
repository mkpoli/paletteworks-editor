<script lang="ts">
  // UI Components
  import Icon from '@iconify/svelte'
  import Button from '$lib/ui/Button.svelte'
  import MenuWrapper from '$lib/ui/MenuWrapper.svelte'

  // Types
  import type { MenuInfo } from '$lib/ui/Menu.svelte'
  import type { Placement } from 'tippy.js'

  // Props
  export let icon: string
  export let text: string
  export let href: string | undefined = undefined
  export let disabled: boolean = false
  export let checked: boolean | undefined = undefined
  export let indeterminate: boolean | undefined = undefined
  export let tooltip:
    | {
        placement: Placement
        offset?: [number, number]
        description?: string
        keys?: Readonly<Readonly<string[]>[]>
      }
    | undefined = undefined

  // Functions
  import hotkeys from 'hotkeys-js'
  import { getContext, onMount } from 'svelte'
  const menuInfo = getContext<MenuInfo>('menu-info')

  const hasSubMenu: boolean = !!$$slots.default
  let subMenu: HTMLDivElement

  let altPressed: boolean

  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  onMount(() => {
    menuInfo.items.push({ element, hasSubMenu })
  })

  import { hideAll } from 'tippy.js'
  function onclick() {
    if (!hasSubMenu && checked === undefined) {
      hideAll()
    }
    dispatch('click')
  }

  let shortcutKey: string | undefined
  let lastShortcut: string | undefined
  const handle = (event: KeyboardEvent) => {
    if (menuInfo.opened) {
      event.preventDefault()
      element.click()
    }
  }
  function registerShortcut(text: string) {
    shortcutKey = text.match(/&([A-Za-z])/)?.[1]
    if (lastShortcut) hotkeys.unbind(lastShortcut, handle)
    if (shortcutKey) {
      lastShortcut = `alt+${shortcutKey.toLowerCase()}`
      hotkeys(lastShortcut, handle)
    }
  }

  $: registerShortcut(text)

  function onkeydown(event: KeyboardEvent) {
    if (event.key == 'Alt') {
      altPressed = true
    }
  }

  function onkeyup(event: KeyboardEvent) {
    if (event.key == 'Alt') {
      altPressed = false
    }
  }

  let element: HTMLButtonElement | HTMLAnchorElement
</script>

<MenuWrapper
  wrap={hasSubMenu}
  menu={subMenu}
  bind:submenuOpened={menuInfo.submenuOpened}
>
  <div class="menu-item" role="menuitem">
    <Button
      {icon}
      {disabled}
      class="text"
      on:click={onclick}
      {href}
      {tooltip}
      bind:element
    >
      <div>
        {@html text.replace(
          /&([A-Za-z])/,
          `<span style="text-decoration: ${
            altPressed ? 'underline' : 'none'
          };">$1</span>`
        )}
      </div>
      {#if hasSubMenu}
        <Icon icon="ic:round-chevron-right" width="1.5em" class="chevron" />
      {/if}
      {#if checked !== undefined}
        {#if checked}
          <Icon
            icon="mdi:checkbox-marked-circle"
            width="1.5em"
            class="chevron"
          />
        {:else if indeterminate}
          <Icon
            icon="mdi:checkbox-marked-circle-outline"
            width="1.5em"
            class="chevron"
          />
        {:else}
          <Icon
            icon="mdi:checkbox-blank-circle-outline"
            width="1.5em"
            class="chevron"
          />
        {/if}
      {/if}
    </Button>
  </div>
  <slot slot="menu" />
</MenuWrapper>

<svelte:window on:keydown={onkeydown} on:keyup={onkeyup} />

<style>
  .menu-item :global(button),
  .menu-item :global(a) {
    width: 100%;
    justify-content: left;
    border-radius: 0;
  }

  .menu-item :global(button:hover:not([disabled])),
  .menu-item :global(a:hover:not(.disabled)) {
    filter: brightness(1.25) drop-shadow(0 0 0.5em rgba(255, 255, 255, 1));
  }

  .menu-item :global(button:focus-visible:not([disabled])),
  .menu-item :global(a:focus-visible:not(.disabled)) {
    filter: brightness(1.25) drop-shadow(0 0 0.5em rgba(255, 255, 255, 0.85));
    color: #000;
    outline: 2px solid #ffffff;
    background: linear-gradient(122deg, #ffc107, #ff8b00);
  }

  .menu-item :global(button[disabled]),
  .menu-item :global(a.disabled) {
    filter: blur(0.5px) brightness(0.85);
  }

  .menu-item :global(.chevron) {
    /* justify-self: flex-end; */
    margin-left: auto;
    margin-right: -0.5em;
  }
</style>
