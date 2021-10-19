<script lang="ts">
  import { BEAT_IN_MEASURE, COLORS, LANE_AREA_WIDTH, LANE_WIDTH, MARGIN, MARGIN_BOTTOM, MEASURE_HEIGHT, TEXT_MARGIN, TICK_PER_MEASURE } from "$lib/consts";

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'

  // Props
  export let maxMeasure: number

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

  $: graphics && drawBackground($position, maxMeasure)

  function drawBackground(
    position: PositionManager,
    maxMeasure: number,
  ) {
    const topY = position.calcY(maxMeasure * TICK_PER_MEASURE)
    const innerHeight = position.containerHeight
    graphics.removeChildren()
    graphics.clear()

    // Draw lanes
    for (let i = 1; i < 14; i++) {
      const x = MARGIN + i * LANE_WIDTH
      if (i % 2 != 0) {
        graphics.lineStyle(2, COLORS.COLOR_LANE_PRIMARY, 1, 0.5)
      } else {
        graphics.lineStyle(1, COLORS.COLOR_LANE_SECONDARY, 1, 0.5)
      }
      graphics.moveTo(x, innerHeight)
      graphics.lineTo(x, topY - MEASURE_HEIGHT / BEAT_IN_MEASURE)
    }

    // Draw bars
    for (let i = 0; i < maxMeasure * BEAT_IN_MEASURE + 1 ; i++) {
      const y = innerHeight - (MARGIN_BOTTOM + i * position.measureHeight / BEAT_IN_MEASURE)

      if (i % BEAT_IN_MEASURE == 0) {
        graphics.lineStyle(2, COLORS.COLOR_BAR_PRIMARY, 1, 0.5)
        graphics.moveTo(MARGIN, y)
        graphics.lineTo(MARGIN + LANE_AREA_WIDTH, y)

        const number = i / BEAT_IN_MEASURE
        const text = new PIXI.Text(`#${number + 1}`, {
          fill: 'white'
        })
        text.x = MARGIN - TEXT_MARGIN
        text.y = y
        text.anchor.x = 1
        text.anchor.y = 0.5
        graphics.addChild(text)
      } else {
        graphics.lineStyle(1, COLORS.COLOR_BAR_SECONDARY, 1, 0.5)
        graphics.moveTo(MARGIN + LANE_WIDTH, y)
        graphics.lineTo(MARGIN + LANE_AREA_WIDTH - LANE_WIDTH, y)
      }
    }
  }
</script>
