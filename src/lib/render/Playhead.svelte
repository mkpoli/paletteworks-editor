<script lang="ts">
  // Constants
  import { COLORS, LANE_AREA_WIDTH, MARGIN } from "$lib/consts"

  // Stores
  import { cursor, position } from '$lib/position'
  import { dragging } from "$lib/editing/playhead"

  // Functions
  import { getContext, onDestroy, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'

  // Props
  export let currentTick: number
  export let paused: boolean

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let graphics: PIXI.Graphics

  onMount(async () => {
    graphics = new PIXI.Graphics()
    graphics.zIndex = -1
    graphics.interactive = true
    graphics.addListener('pointerdown', () => {
      if (paused) {
        $dragging = true
      }
    })
    graphics.addListener('pointermove', () => {
      if ($dragging) {
        currentTick = $cursor.rawTick
      }
    })
    app.renderer.view.addEventListener('pointerup', () => {
      if ($dragging) $dragging = false
    })
    mainContainer.addChild(graphics)
  })

  onDestroy(() => {
    mainContainer.removeChild(graphics)
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
