<script lang="ts">
  import { COLORS, LANE_WIDTH, NOTE_HEIGHT_REAL } from '$lib/consts'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onDestroy, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Note, Single, Slide } from '$lib/score/beatmap'

  // Props
  export let singles: Single[]
  export let slides: Slide[]

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')

  // Variables
  let graphics: PIXI.Graphics
  let time = 0

  onMount(() => {
    graphics = new PIXI.Graphics()
    graphics.zIndex = 5
    app.stage.addChild(graphics)
    app.ticker.add(changeAlpha)
  })

  onDestroy(() => {
    app.ticker.remove(changeAlpha)
    app.stage.removeChild(graphics)
  })

  function changeAlpha(deltaT: number) {
    time += deltaT * 0.1
    graphics.alpha = 0.85 * Math.max(0, Math.sin(time) + 0.38196601125)
  }

  $: drawErrorArea($position, singles, slides)


  function drawErrorArea(
    position: PositionManager,
    singles: Single[], slides: Slide[]
  ) {
    if (!graphics) return

    graphics.removeChildren()
    graphics.clear()

    let tickTable = new Map<number, Note[]>()

    ;[...singles, ...slides.flatMap(({ head, tail, steps }) => [head, tail, ...steps])]
      .forEach((note) => {
        tickTable.set(note.tick, [...(tickTable.get(note.tick) ?? []), note])
      })

    graphics.beginFill(COLORS.COLOR_STACKED, COLORS.ALPHA_STACKED)
    ;[...tickTable.entries()].forEach(([tick, notes]) => {
      const area: number[] = new Array(16).fill(0)
      area[0] = area[1] = area[14] = area[15] = 1
      notes.forEach(({ lane: laneL, width }) => {
        const laneR = laneL + width - 1
        for (let i = 0; i < 16; i++) {
          if (i >= laneL && i <= laneR) {
            area[i] += 1
          }
        }
      })

      const MARGIN_X = 10
      const MARGIN_Y = 8

      const n = area
        .map((v, i) => v > 1 ? i : undefined)
        .filter((i): i is number => i !== undefined)
        .reduce((acc, cur) => {
          let lastArray = acc[acc.length - 1]
          if (!lastArray || lastArray[lastArray.length - 1] + 1 !== cur) {
            lastArray = []
            acc.push(lastArray)
          }

          if (lastArray.length >= 2) {
            lastArray[1] = cur
          } else {
            lastArray.push(cur)
          }

          return acc
        }, [] as number[][])

      n.forEach(([lane, laneR]) => {
        graphics.drawRoundedRect(
          position.calcX(lane) - 0.5 * MARGIN_X,
          position.calcY(tick) - 0.5 * NOTE_HEIGHT_REAL - 0.5 * MARGIN_Y,
          ((laneR ?? lane) - lane + 1) * LANE_WIDTH + MARGIN_X,
          NOTE_HEIGHT_REAL + MARGIN_Y,
          5
        ) 
      })
    })
    graphics.endFill()
  }
</script>
