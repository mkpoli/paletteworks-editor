<script lang="ts">
  import type PIXI from 'pixi.js'
  import COLORS from '$lib/colors'
  import { getContext, onMount } from 'svelte'

  export let dragging: boolean
  export let rect: PIXI.Rectangle

  let graphics: PIXI.Graphics

  let PIXI: typeof import('pixi.js')

  const app = getContext<PIXI.Application>('app')
  onMount(async () => {
    (PIXI = await import('pixi.js'))

    graphics = new PIXI.Graphics()
    graphics.zIndex = 9
    app.stage.addChild(graphics)
  })

  function draw(graphics: PIXI.Graphics, rect: PIXI.Rectangle, dragging: boolean) {
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