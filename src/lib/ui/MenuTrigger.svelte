<script lang="ts" context="module">
  declare module 'tippy.js' {
    interface Props {
      hideOnPopperBlur: boolean
    }
  }
</script>

<script lang="ts">
  // Functions
  import tippy from 'tippy.js'
  import { createEventDispatcher, onMount, getContext } from 'svelte'

  // Types
  import type { Instance as TippyInstance } from 'tippy.js'
  import type { MenuInfo } from './Menu.svelte'

  // Props
  export let menu: HTMLDivElement
  export let contextArea: HTMLElement | undefined = undefined
  export let sub: boolean = false
  export let opened: boolean = false
  export const open: () => void = () => {
    if (instance) instance.show()
  }

  // Contexts
  const menuInfo = getContext<MenuInfo>('menu-info')

  // Variables
  let instance: TippyInstance

  const dispatch = createEventDispatcher<{
    contextmenu: void
    hidden: void
    show: void
    right: void
  }>()

  function onShow() {
    menuInfo.opened = true
    opened = true
    trap?.activate()
    dispatch('show')
  }

  function onHidden() {
    menuInfo.opened = false
    opened = false
    trap?.deactivate()
  }

  import * as focusTrap from 'focus-trap'
  import type { FocusTrap } from 'focus-trap'

  let trap: FocusTrap

  $: if (menu) {
    trap = focusTrap.createFocusTrap(menu, { fallbackFocus: menu, clickOutsideDeactivates: true })
  }

  import hotkeys from 'hotkeys-js'
  hotkeys('esc,left', (event) => {
    if (instance && opened && !menuInfo.submenuOpened) {
      event.preventDefault()
      instance.hide()
    }
  })
  hotkeys('right', (event) => {
    if (instance && opened && !menuInfo.submenuOpened && document.activeElement && menuInfo.items.some(({ element, hasSubMenu }) => hasSubMenu && element === document.activeElement)) {
      event.preventDefault()
      ;(document.activeElement as HTMLButtonElement).click()
    }
  })
  hotkeys('up,down', (event, handler) => {
    if (instance && opened && !menuInfo.submenuOpened && document.activeElement && menu.contains(document.activeElement)) {
      event.preventDefault()
      event.stopPropagation()

      const elements = menuInfo.items.map(({ element }) => element)
      switch (handler.key) {
        case 'up':
          elements.rotatePrev(document.activeElement as HTMLButtonElement | HTMLAnchorElement).focus()
          break
        case 'down':
          elements.rotateNext(document.activeElement as HTMLButtonElement | HTMLAnchorElement).focus()
          break
      }
    }
  })

  let trigger: HTMLDivElement
  onMount(() => {
    if (!contextArea) {
      // Normal Menu
      instance = tippy(trigger, {
        trigger: 'click',
        interactive: true,
        role: 'menu',
        placement: !sub ? 'top' : 'right-start',
        offset: [-4, 5],
        delay: [0, 0],
        onShow,
        onHidden,
        appendTo: document.body,
      })
    }
  })

  $: if (menu && instance) {
    instance.setContent(menu)
  }

  $: if (contextArea) {
    // Context Menu
    instance = tippy(contextArea, {
      placement: 'right-start',
      trigger: 'manual',
      interactive: true,
      role: 'menu',
      offset: [0, 0],
      delay: [0, 0],
      onShow,
      onHidden,
      onHide() {
        dispatch('hidden')
      }
    })

    contextArea.addEventListener('contextmenu', (event: MouseEvent) => {
      event.preventDefault()

      dispatch('contextmenu')

      if (menu.childElementCount < 1) {
        return
      }

      const mouseRect = new DOMRect(event.clientX, event.clientY, 0, 0)
      instance.setProps({
        getReferenceClientRect: () => mouseRect
      })

      instance.show()
    })
  }
</script>

{#if !contextArea}
  <div bind:this={trigger} class={$$props.class}>
    <slot/>
  </div>
{/if}

<style>
  div {
    width: 100%;
  }
</style>