<script lang="ts">
  import type PIXI from 'pixi.js'
  import COLORS from '$lib/colors'
  import { getContext, onDestroy, onMount } from 'svelte'
  import { Z_INDEX } from '$lib/consts'

  export let dragging: boolean
  export let rect: PIXI.Rectangle

  let graphics: PIXI.Graphics

  // Contexts
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  onMount(() => {
    graphics = new PIXI.Graphics()
    graphics.zIndex = Z_INDEX.SELECTION
    mainContainer.addChild(graphics)
  })

  onDestroy(() => {
    mainContainer.removeChild(graphics)
  })

  function draw(
    graphics: PIXI.Graphics,
    rect: PIXI.Rectangle,
    dragging: boolean
  ) {
    graphics.clear()

    if (dragging) {
      graphics.lineStyle(3, COLORS.COLOR_SELECTION, 1)
      graphics.beginFill(COLORS.COLOR_SELECTION, COLORS.ALPHA_SELECTION)
      graphics.drawRect(rect.x, rect.y, rect.width, rect.height)
      graphics.endFill()
    }
  }

  $: graphics && draw(graphics, rect, dragging)
</script>
