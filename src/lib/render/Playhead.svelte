<script lang="ts">
  // Constants
  import { COLORS, LANE_AREA_WIDTH, MARGIN } from "$lib/consts"

  // Functions
  import { position } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'

  // Props
  export let currentTick: number

  // Contexts
  const app = getContext<PIXI.Application>('app')

  // Variables
  let PIXI: typeof import('pixi.js')
  let graphics: PIXI.Graphics

  onMount(async () => {
    PIXI = await import('pixi.js')
    graphics = new PIXI.Graphics()
    graphics.zIndex = -1
    app.stage.addChild(graphics)
  })

  $: graphics && drawPlayhead($position.calcY(currentTick))

  import playheadImage from '$assets/playhead.png'
  import { drawDashedLine } from "./renderer"
  function drawPlayhead(y: number) {
    graphics.clear()
    graphics.removeChildren()
    graphics.lineStyle(2, COLORS.COLOR_PLAYHEAD, 1)
    const playhead = PIXI.Sprite.from(playheadImage)
    playhead.anchor.set(1, 0.5)
    playhead.setTransform(MARGIN, y)
    graphics.addChild(playhead)
    drawDashedLine(graphics, MARGIN, y, MARGIN + LANE_AREA_WIDTH, y, 2, 2)
    return 
  }
</script>
