<script lang="ts">
  import { BEAT_IN_MEASURE, COLORS, LANE_AREA_WIDTH, LANE_WIDTH, MARGIN, MARGIN_BOTTOM, TEXT_MARGIN, TICK_PER_MEASURE } from "$lib/consts";

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Writable } from 'svelte/store'

  // Props
  export let maxMeasure: number
  export let snapTo: number

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const fontLoaded = getContext<Writable<boolean>>('fontLoaded')

  // Variables
  let graphics: PIXI.Graphics

  onMount(async () => {
    graphics = new PIXI.Graphics()
    graphics.zIndex = -1
    app.stage.addChild(graphics)
  })

  $: if (graphics && $fontLoaded) {
    drawBackground($position, maxMeasure)
  }

  function drawBackground(
    position: PositionManager,
    maxMeasure: number,
  ) {
    const innerHeight = position.containerHeight
    graphics.removeChildren()
    graphics.clear()

    // Draw lanes
    for (let i = 1; i < 14; i++) {
      const x = MARGIN + i * LANE_WIDTH
      const primary = i % 2 !== 0

      if (primary) {
        graphics.lineStyle(2, COLORS.COLOR_LANE_PRIMARY, 1, 0.5)
      } else {
        graphics.lineStyle(1, COLORS.COLOR_LANE_SECONDARY, 1, 0.5)
      }
      graphics.moveTo(x, innerHeight)
      graphics.lineTo(x, position.calcY(maxMeasure * TICK_PER_MEASURE) - MARGIN_BOTTOM)
    }

    // Draw bars
    for (let i = 0; i < maxMeasure * BEAT_IN_MEASURE + 1 ; i++) {
      const y = innerHeight - (MARGIN_BOTTOM + i * position.measureHeight / BEAT_IN_MEASURE)

      if (i % BEAT_IN_MEASURE == 0) {
        graphics.lineStyle(2, COLORS.COLOR_BAR_PRIMARY, 1, 0.5)
        graphics.moveTo(MARGIN, y)
        graphics.lineTo(MARGIN + LANE_AREA_WIDTH, y)

        const number = i / BEAT_IN_MEASURE
        const text = new PIXI.BitmapText(`#${number + 1}`, {
          fontName: 'Font',
          tint: 0xFFFFFF,
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

    // DrawSnappingLines
    if (snapTo > 192) return

    for (let i = 0; i < maxMeasure * snapTo; i++) {
      const tick = TICK_PER_MEASURE / snapTo * i
      if (tick % 480 === 0) continue
      const y = position.calcY(tick)
      graphics.lineStyle(1, COLORS.COLOR_LANE_SECONDARY, 1, 0.5)
      graphics.moveTo(MARGIN + LANE_WIDTH, y)
      graphics.lineTo(MARGIN + LANE_AREA_WIDTH - LANE_WIDTH, y)
    }
  }
</script>
