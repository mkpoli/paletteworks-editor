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
  import { moving, movingNotes, movingOrigins, movingTargets, movingOffsets } from '$lib/editing/moving'
  import { cursor } from '$lib/position'
  import { calcResized, resizing, resizingNotes, resizingOffsets, resizingOrigins, resizingTargets, resizingOriginNote } from '$lib/editing/resizing'
  import { selectedNotes } from '$lib/editing/selection'

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')

  // Event
  const dispatch = createEventDispatcher<{
    click: { note: Note },
    rightclick: { note: Note },
    dblclick: { note: Note },
    pointerenter: void,
    pointerleave: void,
  }>()

  // Variables
  let graphics: PIXI.Graphics
  let middle: PIXI.Container
  let controlL: PIXI.Graphics
  let controlR: PIXI.Graphics
  const SIDE_MARGIN = 10

  // Moving
  function onmovestart() {
    if ($resizing) return
    $moving = true
    $movingNotes = $selectedNotes.length ? $selectedNotes : [note]
    $movingOrigins = new Map()
    $movingTargets = new Map()
    $movingNotes.forEach((movingNote) => {
      $movingOffsets.set(movingNote, {
        lane: $cursor.lane - movingNote.lane,
        tick: $cursor.tick - movingNote.tick
      })
      $movingOrigins.set(movingNote, {
        lane: movingNote.lane,
        tick: movingNote.tick
      })
      $movingTargets.set(movingNote, {
        lane: movingNote.lane,
        tick: movingNote.tick
      })
    })
  }

  function onmoving() {
    if ($moving && $movingNotes.includes(note)) {
      const { lane, tick } = $movingOffsets.get(note)!
      $movingTargets.set(note, {
        lane: $cursor.lane - lane,
        tick: $cursor.tick - tick
      })
    }
  }

  function onresizestart(right: boolean) {
    return () => {
      if ($moving) return
      $resizing = true
      $resizingOriginNote = note
      $resizingOrigins = new Map()
      $resizingTargets = new Map()
      $resizingNotes = $selectedNotes.length && $selectedNotes.includes(note) ? $selectedNotes : [note]
      $resizingNotes.forEach((note) => {
        const reference = right ? note.lane : note.lane + note.width
        const mutating = right ? note.lane + note.width : note.lane
        const offset = $cursor.laneSide - mutating
        $resizingOffsets.set(note, { reference, mutating, offset })
        $resizingOrigins.set(note, { lane: note.lane, width: note.width })
        $resizingTargets.set(note, { lane: note.lane, width: note.width })
      })
    }
  }

  function onresizing() {
    if ($resizing && $resizingNotes.includes(note)) {
      const { reference, offset } = $resizingOffsets.get(note)!
      // if ($cursor.laneSide - offset === reference) return
      const [ lane, width ] = calcResized(reference, $cursor.laneSide - offset)
      console.log({ reference, offset, lane, width, LmO: $cursor.laneSide - offset })
      $resizingTargets.set(note, { lane, width })
    }
  }

  onMount(async () => {
    controlL = new PIXI.Graphics()
    controlL.zIndex = 5
    controlL.interactive = true
    controlL.addListener('pointerdown', onresizestart(false))
    controlL.cursor = 'ew-resize'
    app.stage.addChild(controlL)

    controlR = new PIXI.Graphics()
    controlR.zIndex = 5
    controlR.cursor = 'ew-resize'
    controlR.interactive = true
    controlR.addListener('pointerdown', onresizestart(true))
    controlR.cursor = 'ew-resize'
    app.stage.addChild(controlR)

    app.renderer.view.addEventListener('pointermove', onresizing)

    graphics = new PIXI.Graphics()
    graphics.zIndex = 4
    app.stage.addChild(graphics)

    middle = new PIXI.Container()
    middle.zIndex = 5
    middle.interactive = true
    middle.cursor = 'move'
    middle.addEventListener('pointerdown', onmovestart)
    middle.addEventListener('pointerenter', () => {
      dispatch('pointerenter')
    })
    middle.addEventListener('pointerleave', () => {
      dispatch('pointerleave')
    })
    middle.addEventListener('click', (event: PIXI.FederatedPointerEvent) => {
      if (event.button === 0) {
        if (event.detail === 1) {
          dispatch('click', { note })
        } else if (event.detail === 2) {
          dispatch('click', { note })
          dispatch('dblclick', { note })
        }
      } else if (event.button === 2) {
        dispatch('rightclick', { note })
      }
    })
    app.stage.addChild(middle)

    app.renderer.view.addEventListener('pointermove', onmoving)
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

  $: if (graphics && controlL && controlR && rect) {
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
