<script lang="ts">
  // Constants
  import {
    COLORS,
    TEXT_MARGIN,
    TICK_PER_BEAT,
    Z_INDEX
  } from '$lib/consts'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onDestroy, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import { preferences } from '$lib/preferences'

  // Props
  export let bpms: Map<number, number>
  export let timeSignatures: Map<number, [number, number]>

  // Contexts
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let graphics: PIXI.Graphics

  onMount(() => {
    graphics = new PIXI.Graphics()
    graphics.zIndex = Z_INDEX.BAR
    mainContainer.addChild(graphics)
  })

  onDestroy(() => {
    mainContainer.removeChild(graphics)
  })

  $: graphics && PIXI && PIXI.BitmapFont.available['Font'] && drawBPMs($position, bpms, timeSignatures)

  function drawBPMs(position: PositionManager, bpms: Map<number, number>, timeSignatures: Map<number, [number, number]>) {
    graphics.clear()
    graphics.removeChildren()

    const left = position.calcX(1)

    graphics.lineStyle(1, COLORS.COLOR_BPM, 0.95)
    // Draw BPMs
    bpms.forEach((bpm, tick) => {
      const newY = position.calcY(tick)

      // Draw BPM LINES
      graphics.moveTo(left, newY)
      graphics.lineTo(left + position.laneAreaWidth, newY)

      // Draw BPM Texts
      const text = graphics.addChild(new PIXI.BitmapText(`♩=${bpm}`, {
        tint: COLORS.COLOR_BPM,
        fontName: 'Font',
      }))
      text.anchor.set(0.5, 0.5)

      text.setTransform(left + position.laneAreaWidth + $preferences.laneWidth + TEXT_MARGIN, newY)
    })

    graphics.lineStyle(1, COLORS.COLOR_TIME_SIGNATURE, 0.95)
    let accumulatedTicks = 0
    // Draw Time Signatures
    ;[...timeSignatures].forEach(([measure, [beatPerMeasure, beatLength]], ind, arr) => {
      const [nextMeasure] = arr[ind + 1] ?? [Infinity]

      const newY = position.calcY(accumulatedTicks)
      accumulatedTicks += (nextMeasure - measure) * (beatPerMeasure / beatLength * 4) * TICK_PER_BEAT
 
      // Draw Time Signature LINES
      graphics.moveTo(left, newY)
      graphics.lineTo(left + position.laneAreaWidth, newY)
      // Draw Time Signature Texts
      const text = graphics.addChild(new PIXI.BitmapText(`${beatPerMeasure}/${beatLength}`, {
        tint: COLORS.COLOR_TIME_SIGNATURE,
        fontName: 'Font',
      }))
      text.anchor.set(0.5, 0.5)
      text.setTransform(left - 2 * TEXT_MARGIN, newY - 30)
    })
  }
</script>
