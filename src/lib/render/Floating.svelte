<script lang="ts">
  // Imports
  import { position } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js' 
  import type { Mode } from '$lib/editing'

  // Consts
  import COLORS from '$lib/colors'
  import {
    LANE_AREA_WIDTH,
    TEXT_MARGIN,
    MARGIN,
    NOTE_HEIGHT,
    NOTE_WIDTH,
    NOTE_PIVOT,
    DIAMOND_PIVOT,
    DIAMOND_HEIGHT,
    DIAMOND_WIDTH,
    LANE_WIDTH,
  } from '$lib/consts'
  import { MODE_TEXTURES } from '$lib/editing'
  import { drawDashedLine } from './renderer';

  // Props
  export let currentMode: Mode
  export let pointerLane: number
  export let pointerTick: number
  export let bpms

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  // Variables
  let PIXI: typeof import('pixi.js')
  let graphics: PIXI.Graphics

  onMount(async () => {
    PIXI = await import('pixi.js')
    graphics = new PIXI.Graphics()
    graphics.zIndex = 4
    app.stage.addChild(graphics)
  })

  $: if (graphics) {
    drawSnappingElements(
      currentMode, $position.calcX(pointerLane) + LANE_WIDTH, $position.calcY(pointerTick), bpms.has(pointerTick)
    )
  }

  let lastText: PIXI.Text
  function drawSnappingElements(
    currentMode: Mode, x:number, y: number, hasBPM: boolean
  ) {
    graphics.clear()
    if (lastText && !lastText.destroyed) {
      lastText.destroy()
    }
    graphics.removeChildren()
  
    if (currentMode == 'select') {
      return
    }
  
    if (currentMode == 'bpm') {
      const text = new PIXI.Text(hasBPM ? `↑ BPM` : `+ BPM`, {
        fill: COLORS.COLOR_BPM,
        fontSize: 20
      })
      text.anchor.set(0.5, 0.5)
      text.setTransform(MARGIN + LANE_AREA_WIDTH + 3 * TEXT_MARGIN, hasBPM ? y + 25 : y)
      lastText = graphics.addChild(text)
      
      if (!hasBPM) {
        graphics.lineStyle(2, COLORS.COLOR_BPM, 1)
        drawDashedLine(graphics, MARGIN, y, MARGIN + LANE_AREA_WIDTH, y)
      }
      return
    }
  
    if (currentMode === 'flick') {
      const flickArrow: PIXI.Sprite = new PIXI.Sprite(
        TEXTURES['notes_flick_arrow_02.png']
      )
      flickArrow.anchor.set(0.5, 0.5)
      flickArrow.setTransform(x, y - 45)
      flickArrow.alpha = 0.5
      flickArrow.height = 0.75 * NOTE_HEIGHT
      flickArrow.width = NOTE_WIDTH
      graphics.addChild(flickArrow)
    }
  
    const floating: PIXI.Sprite = new PIXI.Sprite(
      TEXTURES[currentMode === 'flick' ? 'noteF.png' : MODE_TEXTURES[currentMode]]
    )
    floating.anchor.set(0.5, 0.5)
    floating.setTransform(x, y)
    
    switch (currentMode) {
      case 'tap':
      case 'flick':
      case 'slide':
      case 'critical': {
        const [NOTE_PIVOT_X, NOTE_PIVOT_Y] = NOTE_PIVOT
        floating.pivot.set(NOTE_PIVOT_X, NOTE_PIVOT_Y)
        floating.height = NOTE_HEIGHT
        floating.width = NOTE_WIDTH * 2
        break
      }
      case 'mid': {
        const [DIAMOND_PIVOT_X, DIAMOND_PIVOT_Y] = DIAMOND_PIVOT
        floating.pivot.set(DIAMOND_PIVOT_X, DIAMOND_PIVOT_Y)
        floating.height = DIAMOND_HEIGHT
        floating.width = DIAMOND_WIDTH
      }
    }
  
    floating.alpha = 0.5
    graphics.addChild(floating)
    // floating.setTransform(MARGIN + LANE_AREA_WIDTH + 3 * TEXT_MARGIN, y)
  }
</script>
