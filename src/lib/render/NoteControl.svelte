<script lang="ts">
  // Constants
  import { COLORS, DIAMOND_HEIGHT, DIAMOND_WIDTH, LANE_WIDTH, NOTE_HEIGHT, NOTE_WIDTH } from '$lib/consts'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onDestroy, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'

  // Props
  export let draw: boolean
  export let rect: PIXI.Rectangle

  // Contexts
  const app = getContext<PIXI.Application>('app')

  // Variables
  let PIXI: typeof import('pixi.js')
  let graphics: PIXI.Graphics

  onMount(async () => {
    PIXI = await import('pixi.js')
    
    graphics = new PIXI.Graphics()
    graphics.zIndex = 4
    app.stage.addChild(graphics)
  })

  onDestroy(() => {
    app.stage.removeChild(graphics)
  })

  const SELECTION_MARGIN = 5

  function drawBorder(position: PositionManager) {
    if (draw) {
      graphics.lineStyle(3, COLORS.COLOR_SELECTION, 1)
      graphics.drawRoundedRect(
        rect.x - SELECTION_MARGIN, rect.y - SELECTION_MARGIN,
        rect.width + 2 * SELECTION_MARGIN, rect.height + 2 * SELECTION_MARGIN, 10
      )
    }
  }

  const CONTROL_SIZE = 10
  function drawControl(position: PositionManager, x, y) {
    graphics.lineStyle(2, COLORS.COLOR_SELECTION, 1)
    graphics.beginFill(0xFFFFFF)
    graphics.drawRect(
      x - CONTROL_SIZE / 2, y - CONTROL_SIZE / 2,
      CONTROL_SIZE, CONTROL_SIZE
    )
    graphics.endFill()
    graphics.interactive = true
    graphics.cursor = 'ew-resize'
  }

  $: if (PIXI) {
    graphics.clear()
    if (draw) {
      drawBorder($position)
      drawControl($position, rect.left - SELECTION_MARGIN, rect.top + rect.height / 2)
      drawControl($position, rect.right + SELECTION_MARGIN, rect.top + rect.height / 2)
    }
  }  
</script>
