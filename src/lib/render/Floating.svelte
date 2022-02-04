<script lang="ts">
  // Imports
  import { placing, position } from '$lib/position'
  import { scrollY } from '$lib/editing/scrolling'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js' 
  import type { Mode } from '$lib/editing/modes'
  import type { Note as NoteType } from '$lib/score/beatmap'

  // Consts
  import COLORS from '$lib/colors'
  import {
    TEXT_MARGIN,
    Z_INDEX,
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

  // Stores
  import { pointer, cursor } from '$lib/position'

  // Functions
  import { hasFlick } from '$lib/score/beatmap'

  // Contexts
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let graphics: PIXI.Graphics
  let container: PIXI.Container
  let floating: PIXI.Sprite

  let isMounted: boolean = false
  onMount(() => {
    container = new PIXI.Container()
    container.alpha = 0.5
    container.zIndex = Z_INDEX.FLOATING_NOTE
    mainContainer.addChild(container)

    graphics = new PIXI.Graphics()
    graphics.zIndex = Z_INDEX.FLOATING_BAR
    mainContainer.addChild(graphics)

    floating = new PIXI.Sprite()
    floating.anchor.set(0.5, 0.5)
    floating.scale.set(0.25, 0.25)
    floating.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
    container.addChild(floating)

    isMounted = true
  })

  // Update floating texture & visibility
  $: if (isMounted) {
    floating.texture = TEXTURES[MODE_FLOATING_TEXTURES[currentMode]]

    if (currentMode === 'mid') {
      floating.visible = true
    } else {
      floating.visible = false
    }
  }

  // Update floating position
  $: if (isMounted && $pointer && $scrollY && floating.visible) {
    switch (currentMode) {
      case 'mid':
        container.setTransform($pointer.x, $pointer.y + $scrollY)
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

    const x = $position.calcX(1)

    switch (currentMode) {
      case 'bpm': {
        const text = new PIXI.BitmapText(hasBPM ? `↑ BPM` : `+ BPM`, {
          fontName: 'Font',
          tint: COLORS.COLOR_BPM,
        })
        text.anchor.set(0.5, 0.5)
        text.setTransform(x + $position.laneAreaWidth + 3 * TEXT_MARGIN, hasBPM ? y + 25 : y)
        graphics.addChild(text)

        if (!hasBPM) {
          graphics.lineStyle(2, COLORS.COLOR_BPM, 1)
          drawDashedLine(graphics, x, y, x + $position.laneAreaWidth, y)
        }
        break
      }
      case 'timeSignature': {
        const text = new PIXI.BitmapText(`+ 4/4`, {
          fontName: 'Font',
          tint: COLORS.COLOR_TIME_SIGNATURE,
        })
        text.anchor.set(0.5, 0.5)
        text.setTransform($position.calcX(1) + $position.laneAreaWidth + 3 * TEXT_MARGIN, hasBPM ? y + 25 : y)
        graphics.addChild(text)

        if (!hasBPM) {
          graphics.lineStyle(2, COLORS.COLOR_TIME_SIGNATURE, 1)
          drawDashedLine(graphics, x, y, x + $position.laneAreaWidth, y)
        }
        break
      }
    }
  }

  $: lane = hoveringNote ? hoveringNote.lane : $placing.lane
  $: width = hoveringNote ? hoveringNote.width : $placing.width
  $: tick = hoveringNote ? hoveringNote.tick : $cursor.tick

  $: hoveringNoteFlick = hoveringNote && hasFlick(hoveringNote) ? hoveringNote.flick : 'no'
  $: flick = currentMode === 'flick'
          ? FLICK_TYPES.rotateNext(hoveringNoteFlick)
          : hoveringNoteFlick
</script>

{#if isMounted}
  {#if currentMode === 'tap' || currentMode === 'slide' || currentMode === 'flick' || currentMode === 'critical'}
    <Note
      {lane}
      {width}
      {tick}
      {flick}
      slide={currentMode === 'slide'}
      critical={currentMode === 'critical'}
      alpha={0.5}
    />
  {/if}
{/if}