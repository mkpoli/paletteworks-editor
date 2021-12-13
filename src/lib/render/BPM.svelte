<script lang="ts">
  import { COLORS, LANE_AREA_WIDTH, LANE_WIDTH, MARGIN, TEXT_MARGIN } from "$lib/consts";

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onDestroy, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'

  // Props
  export let bpms: Map<number, number>

  // Contexts
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let graphics: PIXI.Graphics

  onMount(() => {
    graphics = new PIXI.Graphics()
    mainContainer.addChild(graphics)
  })

  onDestroy(() => {
    mainContainer.removeChild(graphics)
  })

  $: graphics && PIXI && PIXI.BitmapFont.available['Font'] && drawBPMs($position, bpms)

  function drawBPMs(position: PositionManager, bpms: Map<number, number>) {
    graphics.clear()
    graphics.lineStyle(1, COLORS.COLOR_BPM, 1)
    graphics.removeChildren()
  
    // Draw BPMs
    bpms.forEach((bpm, tick) => {
      const newY = position.calcY(tick)
  
      // Draw BPM LINES
      graphics.moveTo(MARGIN, newY)
      graphics.lineTo(MARGIN + LANE_AREA_WIDTH, newY)
  
      // Draw BPM Texts
      const text = graphics.addChild(new PIXI.BitmapText(`♩=${bpm}`, {
          tint: COLORS.COLOR_BPM,
          fontName: 'Font',
        }))
      text.anchor.set(0.5, 0.5)
  
      text.setTransform(MARGIN + LANE_AREA_WIDTH + LANE_WIDTH + TEXT_MARGIN, newY)
    })
  }

</script>
