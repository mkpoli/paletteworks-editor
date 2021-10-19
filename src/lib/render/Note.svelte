<script lang="ts">
  import COLORS from '$lib/colors'
  import { NOTE_HEIGHT } from '$lib/consts';  
  import { getContext, onDestroy, onMount } from "svelte";
  import { selectedNotes } from '$lib/selection'
  import { position } from '$lib/position'

  import type PIXI from 'pixi.js'
  import type { Flick, Note as NoteType } from '$lib/score/beatmap'

  export let note: NoteType
  export let critical: boolean = false
  export let slide: boolean = false

  const { lane, tick, width } = note
  const flick: Flick = 'flick' in note ? note.flick : 'no'
  critical = 'critical' in note ? note.critical : critical

  const type = critical
                ? 'noteC.png'
                : flick !== 'no'
                  ? 'noteF.png'
                  : slide
                    ? 'noteL.png'
                    : 'noteN.png'

  const NOTE_WIDTH = 30
  $: noteWidth = width * NOTE_WIDTH
  const app = getContext<PIXI.Application>('app')
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  let PIXI: typeof import('pixi.js')
  let instance: PIXI.NineSlicePlane
  let currentRect: PIXI.Rectangle

  let border: PIXI.Graphics

  const SELECTION_MARGIN = 5

  onMount(async () => {
    (PIXI = await import('pixi.js'))

    const texture = TEXTURES[type]
    instance = new PIXI.NineSlicePlane(
      texture,
      250, 0, 250, 0
    )
    instance.width = noteWidth
    instance.height = NOTE_HEIGHT
    instance.pivot.x = noteWidth * 0.5
    instance.pivot.y = NOTE_HEIGHT * 0.5
    instance.scale.x = 354 / (248 + 30)
    instance.scale.y = 1
    instance.zIndex = 1
    app.stage.addChild(instance)
    border = new PIXI.Graphics()
    border.zIndex = 8
    app.stage.addChild(border)
  })

  $: if (instance) {
    instance.x = $position.calcMidX(lane, width)
    instance.y = $position.calcY(tick)
    currentRect = new PIXI.Rectangle(
      $position.calcX(lane), $position.calcY(tick) - 0.5 * 0.5 * NOTE_HEIGHT,
      noteWidth, 0.5 * NOTE_HEIGHT
    )
  }

  $: if (PIXI && currentRect) {
    border.clear()
    if ($selectedNotes.includes(note)) {
      border.lineStyle(3, COLORS.COLOR_SELECTION, 1)
      border.drawRoundedRect(
        currentRect.x - SELECTION_MARGIN, currentRect.y - SELECTION_MARGIN,
        currentRect.width + 2 * SELECTION_MARGIN, currentRect.height + 2 * SELECTION_MARGIN, 10
      )
    }
  }

  onDestroy(() => {
    app.stage.removeChild(instance)
    app.stage.removeChild(border)
  })
</script>
