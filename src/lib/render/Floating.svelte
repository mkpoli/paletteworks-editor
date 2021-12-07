<script lang="ts">
  // Imports
  import { position } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js' 
  import type { Mode } from '$lib/editing/modes'
  import type { Note as NoteType } from '$lib/score/beatmap'

  // Consts
  import COLORS from '$lib/colors'
  import {
    LANE_AREA_WIDTH,
    TEXT_MARGIN,
    MARGIN,
    LANE_MAX,
    NOTE_HEIGHT,
  } from '$lib/consts'
  import { FLICK_TYPES } from '$lib/score/beatmap'
  import { MODE_FLOATING_TEXTURES } from '$lib/editing/modes'
  import { drawDashedLine } from './renderer'

  // Props
  export let currentMode: Mode
  export let bpms: Map<number, number>
  export let hoveringNote: NoteType | null

  // Components
  import Note from '$lib/render/Note.svelte'
  import Arrow from '$lib/render//Arrow.svelte'

  // Stores
  import { pointer, cursor } from '$lib/position'
  import { resizingLastWidth } from '$lib/editing/resizing'

  // Functions
  import { hasFlick } from '$lib/score/beatmap'

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')

  // Variables
  let graphics: PIXI.Graphics
  let container: PIXI.Container
  let floating: PIXI.Sprite
  let flickArrow: PIXI.Sprite

  let isMounted: boolean = false
  onMount(() => {
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
    floating.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
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

    if (currentMode === 'mid') {
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
  $: if (graphics && PIXI && PIXI.BitmapFont.available['Font']) {
    drawFloatingBPM(
      currentMode, $position.calcY($cursor.tick),
      bpms.has($cursor.tick)
    )
  }

  function drawFloatingBPM(
    currentMode: Mode, y: number, hasBPM: boolean
  ) {
    graphics.clear()
    graphics.removeChildren()
  
    if (currentMode == 'bpm') {
      const text = new PIXI.BitmapText(hasBPM ? `↑ BPM` : `+ BPM`, {
        fontName: 'Font',
        tint: COLORS.COLOR_BPM,
      })
      text.anchor.set(0.5, 0.5)
      text.setTransform(MARGIN + LANE_AREA_WIDTH + 3 * TEXT_MARGIN, hasBPM ? y + 25 : y)

      if (!hasBPM) {
        graphics.lineStyle(2, COLORS.COLOR_BPM, 1)
        drawDashedLine(graphics, MARGIN, y, MARGIN + LANE_AREA_WIDTH, y)
      }
      return
    }
  }

  $: x = $position.calcMidX(hoveringNote ? hoveringNote.lane : $cursor.lane, (hoveringNote ? hoveringNote.width : $resizingLastWidth))
  $: y = $position.calcY(hoveringNote ? hoveringNote.tick : $cursor.tick)
  $: width = (hoveringNote ? hoveringNote.width : $resizingLastWidth)
</script>

{#if isMounted}
  {#if currentMode === 'tap' || currentMode === 'slide' || currentMode === 'flick' || currentMode === 'critical'}
    {#if currentMode === 'flick'}
      <Arrow
        x={x}
        y={y - NOTE_HEIGHT + 15}
        {width}
        critical={false}
        flick={FLICK_TYPES.rotateNext(hoveringNote && hasFlick(hoveringNote) ? hoveringNote.flick : 'no')}
        alpha={0.5}
        zIndex={4}
      />
      {:else if currentMode === 'critical' && hoveringNote && 'flick' in hoveringNote && hoveringNote.flick !== 'no'}
        <Arrow
          x={x}
          y={y - NOTE_HEIGHT + 15}
          {width}
          critical={true}
          flick={hoveringNote.flick}
          alpha={0.5}
          zIndex={4}
        />
    {/if}
    <Note
      x={x}
      y={y}
      width={width * 123 + 100}
      type={currentMode}
      alpha={0.5}
      zIndex={2}
    />
  {/if}
{/if}