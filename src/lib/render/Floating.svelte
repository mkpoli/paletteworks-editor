<script lang="ts">
  // Imports
  import { position } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js' 
  import { Mode, MODE_FLOATING_TEXTURES } from '$lib/editing/modes'

  // Consts
  import COLORS from '$lib/colors'
  import {
    LANE_AREA_WIDTH,
    TEXT_MARGIN,
    MARGIN,
    LANE_WIDTH,
    LANE_MAX,
  } from '$lib/consts'
  import { MODE_TEXTURES } from '$lib/editing/modes'
  import { drawDashedLine } from './renderer';

  // Props
  export let currentMode: Mode
  export let bpms: Map<number, number>

  // Stores
  import { pointer, cursor } from '$lib/position'

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  // Variables
  let PIXI: typeof import('pixi.js')
  let graphics: PIXI.Graphics
  let container: PIXI.Container
  let floating: PIXI.Sprite
  let flickArrow: PIXI.Sprite

  let isMounted: boolean = false
  onMount(async () => {
    PIXI = await import('pixi.js')
    container = new PIXI.Container
    container.alpha = 0.5
    container.zIndex = 4
    app.stage.addChild(container)

    graphics = new PIXI.Graphics()
    graphics.zIndex = 4
    app.stage.addChild(graphics)

    floating = new PIXI.Sprite()
    floating.anchor.set(0.5, 0.5)
    floating.scale.set(0.25, 0.25)
    container.addChild(floating)

    flickArrow = new PIXI.Sprite(TEXTURES['notes_flick_arrow_02.png'])
    flickArrow.anchor.set(0.5, 0.5)
    flickArrow.scale.set(0.25, 0.25)
    flickArrow.y = -40
    container.addChild(flickArrow)

    isMounted = true
  })

  // Update floating texture & visibility
  $: if (isMounted) {
    floating.texture = TEXTURES[MODE_FLOATING_TEXTURES[currentMode]]

    if (currentMode === 'flick') {
      flickArrow.visible = true
    } else {
      flickArrow.visible = false
    }

    if (
      currentMode === 'critical' || currentMode === 'flick' ||
      currentMode === 'tap' || currentMode === 'slide' || currentMode === 'mid'
    ) {
      floating.visible = true
    } else {
      floating.visible = false
    }
  }

  // Update floating position
  $: if (isMounted && $pointer && floating.visible) {
    switch (currentMode) {
      case 'tap':
      case 'slide':
        if ($cursor.lane > LANE_MAX - 1) {
          floating.scale.x = 0.125
          container.setTransform($position.calcMidX($cursor.lane, 1), $position.calcY($cursor.tick))
        } else {
          floating.scale.x = 0.25
          container.setTransform($position.calcMidX($cursor.lane, 2), $position.calcY($cursor.tick))
        }
        break
      case 'critical':
      case 'flick':
      case 'mid':
        container.setTransform($pointer.x, $pointer.y + app.stage.pivot.y)
        break
    }
  }

  // Draw BPM
  $: if (graphics) {
    drawFloatingBPM(
      currentMode,
      $position.calcX($cursor.lane) + LANE_WIDTH, $position.calcY($cursor.tick),
      bpms.has($cursor.tick)
    )
  }

  let lastText: PIXI.Text
  function drawFloatingBPM(
    currentMode: Mode, x:number, y: number, hasBPM: boolean
  ) {
    graphics.clear()
    if (lastText && !lastText.destroyed) {
      lastText.destroy()
    }
    graphics.removeChildren()
  
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
  }
</script>
