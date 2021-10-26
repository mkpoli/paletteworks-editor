<script lang="ts">
  // Constants
  import { COLORS } from '$lib/consts'

  // Functions
  import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Note } from '$lib/score/beatmap'

  // Props
  export let draw: boolean
  export let rect: PIXI.Rectangle
  export let note: Note

  // Stores
  import { moving } from '$lib/moving'

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const pointer = getContext<{lane: number, tick: number}>('pointer')

  // Event
  const dispatch = createEventDispatcher<{
    move: void,
    movestart: {
      lane: number,
      tick: number,
      note: Note
    },
    moveend: void
  }>()

  // Variables
  let PIXI: typeof import('pixi.js')
  let graphics: PIXI.Graphics
  let middle: PIXI.Container

  onMount(async () => {
    PIXI = await import('pixi.js')
    
    graphics = new PIXI.Graphics()
    graphics.zIndex = 4
    app.stage.addChild(graphics)

    middle = new PIXI.Container()
    middle.zIndex = 5
    middle.interactive = true
    middle.cursor = 'move'
    middle.addListener('pointerdown', (event: PIXI.InteractionEvent) => {
      // event.stopPropagation()
      // if (event.data.button !== 0) {
      //   return
      // }
      app.renderer.view.setPointerCapture(event.data.pointerId)
      dispatch('movestart', {
        lane: pointer.lane,
        tick: pointer.tick,
        note
      })
    })
    middle.addListener('pointermove', () => {
      if (!$moving) return
      dispatch('move')
    })
    middle.addListener('pointerup', (event: PIXI.InteractionEvent) => {
      app.renderer.view.releasePointerCapture(event.data.pointerId)
      dispatch('moveend')
    })
    app.stage.addChild(middle)
  })

  onDestroy(() => {
    app.stage.removeChild(graphics)
    app.stage.removeChild(middle)
  })

  const SELECTION_MARGIN = 5

  function drawBorder() {
    graphics.lineStyle(3, COLORS.COLOR_SELECTION, 1)
    graphics.drawRoundedRect(
      rect.x - SELECTION_MARGIN, rect.y - SELECTION_MARGIN,
      rect.width + 2 * SELECTION_MARGIN, rect.height + 2 * SELECTION_MARGIN, 10
    )
  }

  const CONTROL_SIZE = 10
  function drawControl(x: number, y: number) {
    graphics.lineStyle(2, COLORS.COLOR_SELECTION, 1)
    graphics.beginFill(0xFFFFFF)
    graphics.drawRect(
      x - CONTROL_SIZE / 2, y - CONTROL_SIZE / 2,
      CONTROL_SIZE, CONTROL_SIZE
    )
    graphics.endFill()
    graphics.interactive = true
    graphics.cursor = 'ew-resize'
  }

  $: if (PIXI) {
    graphics.clear()
    middle.hitArea = rect
    if (draw) {
      drawBorder()
      drawControl(rect.left - SELECTION_MARGIN, rect.top + rect.height / 2)
      drawControl(rect.right + SELECTION_MARGIN, rect.top + rect.height / 2)
    }
  }  
</script>
