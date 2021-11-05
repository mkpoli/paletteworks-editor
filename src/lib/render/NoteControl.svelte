<script lang="ts">
  // Constants
  import { COLORS } from '$lib/consts'

  // Functions
  import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte'
  import '$lib/basic/dblclick'

  // Types
  import type PIXI from 'pixi.js'
  import type { Note } from '$lib/score/beatmap'

  // Props
  export let draw: boolean
  export let rect: PIXI.Rectangle
  export let note: Note

  // Stores
  import { moving } from '$lib/editing/moving'
  import { cursor } from '$lib/position'
  import { calcResized, resizing, resizingNotes, resizingOffsets } from '$lib/editing/resizing'
  import { selectedNotes } from '$lib/editing/selection'

  // Contexts
  const app = getContext<PIXI.Application>('app')

  // Event
  const dispatch = createEventDispatcher<{
    move: void,
    movestart: {
      lane: number,
      tick: number,
      note: Note
    },
    moveend: void,
    click: { note: Note },
    rightclick: { note: Note },
    dblclick: { note: Note }
  }>()

  // Variables
  let PIXI: typeof import('pixi.js')
  let graphics: PIXI.Graphics
  let middle: PIXI.Container
  let controlL: PIXI.Graphics
  let controlR: PIXI.Graphics
  const SIDE_MARGIN = 10
  function onresizestart(right: boolean) {
    return () => {
      $resizing = true
      $resizingNotes = $selectedNotes.length && $selectedNotes.includes(note) ? $selectedNotes : [note]
      $resizingNotes.forEach((note) => {
        const reference = right ? note.lane : note.lane + note.width
        const mutating = right ? note.lane + note.width : note.lane
        $resizingOffsets.set(note, { reference, mutating, offset: $cursor.laneSide - mutating })
      })
    }
  }

  function onresizing() {
    if ($resizing && $resizingNotes.includes(note)) {
      const { reference, offset } = $resizingOffsets.get(note)
      if ($cursor.laneSide - offset === reference) return
      [note.lane, note.width] = calcResized(reference, $cursor.laneSide - offset)
      note = note
    }
  }

  function onresizeend() {
    $resizing = false
  }

  onMount(async () => {
    PIXI = await import('pixi.js')
    
    controlL = new PIXI.Graphics()
    controlL.zIndex = 5
    controlL.interactive = true
    controlL.addListener('pointerdown', onresizestart(false))
    controlL.addListener('pointermove', onresizing)
    controlL.addListener('pointerup', onresizeend)
    controlL.cursor = 'ew-resize'
    app.stage.addChild(controlL)

    controlR = new PIXI.Graphics()
    controlR.zIndex = 5
    controlR.cursor = 'ew-resize'
    controlR.interactive = true
    controlR.addListener('pointerdown', onresizestart(true))
    controlR.addListener('pointermove', onresizing)
    controlR.addListener('pointerup', onresizeend)
    controlR.cursor = 'ew-resize'
    app.stage.addChild(controlR)

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
        lane: $cursor.lane,
        tick: $cursor.tick,
        note
      })
    })
    middle.addListener('pointermove', () => {
      if (!$moving || $resizing) return
      dispatch('move')
    })
    middle.addListener('pointerup', (event: PIXI.InteractionEvent) => {
      app.renderer.view.releasePointerCapture(event.data.pointerId)
      if (!$moving || $resizing) return
      dispatch('moveend')
    })
    middle.addListener('click', () => {
      dispatch('click', { note })
    })
    middle.addListener('rightclick', () => {
      dispatch('rightclick', { note })
    })
    middle.addListener('dblclick', () => {
      dispatch('dblclick', { note })
    })
    app.stage.addChild(middle)
  })

  onDestroy(() => {
    app.stage.removeChild(graphics)
    app.stage.removeChild(middle)
    app.stage.removeChild(controlL)
    app.stage.removeChild(controlR)
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
  function drawControl(graphics: PIXI.Graphics, x: number, y: number) {
    graphics.lineStyle(2, COLORS.COLOR_SELECTION, 1)
    graphics.beginFill(0xFFFFFF)
    graphics.drawRect(
      x - CONTROL_SIZE / 2, y - CONTROL_SIZE / 2,
      CONTROL_SIZE, CONTROL_SIZE
    )
    graphics.endFill()
  }

  $: if (PIXI && rect) {
    graphics.clear()
    controlL.clear()
    controlR.clear()
    middle.hitArea = new PIXI.Rectangle(
      rect.x + SIDE_MARGIN, rect.y, rect.width - 2 * SIDE_MARGIN, rect.height
    )
    controlL.hitArea = new PIXI.Rectangle(
      rect.x - SIDE_MARGIN, rect.y, SIDE_MARGIN * 2, rect.height
    )
    controlR.hitArea = new PIXI.Rectangle(
      rect.right - SIDE_MARGIN, rect.y, SIDE_MARGIN * 2, rect.height
    )

    if (draw) {
      drawBorder()
      drawControl(controlL, rect.left - SELECTION_MARGIN, rect.top + rect.height / 2)
      drawControl(controlR, rect.right + SELECTION_MARGIN, rect.top + rect.height / 2)
    }
  }
</script>
