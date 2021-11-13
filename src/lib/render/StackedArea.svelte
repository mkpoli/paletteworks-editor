<script lang="ts">
  import { COLORS, LANE_MAX, LANE_MIN, LANE_WIDTH, NOTE_HEIGHT_REAL } from '$lib/consts'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Note, Single, Slide } from '$lib/score/beatmap'

  // Props
  export let singles: Single[]
  export let slides: Slide[]

  // Contexts
  const app = getContext<PIXI.Application>('app')

  // Variables
  let PIXI: typeof import('pixi.js')
  let graphics: PIXI.Graphics

  onMount(async () => {
    PIXI = await import('pixi.js')
    graphics = new PIXI.Graphics()
    graphics.zIndex = 5
    app.stage.addChild(graphics)
    
    let time = 0

    const changeAlpha = (deltaT: number) => {
      time += deltaT * 0.1
      graphics.alpha = Math.sin(time)
    }

    app.ticker.add(changeAlpha)

    return () => {
      app.stage.removeChild(graphics)
      app.ticker.remove(changeAlpha)
    }
  })

  $: drawStackedArea($position, singles, slides)


  function drawStackedArea(
    position: PositionManager,
    singles: Single[], slides: Slide[]
  ) {
    if (!graphics) return

    graphics.removeChildren()
    graphics.clear()

    let tickTable = new Map<number, Note[]>()

    ;[...singles, ...slides.flatMap(({ head, tail, steps }) => [head, tail, ...steps])]
      .forEach((note) => {
        if (tickTable.has(note.tick)) {
          tickTable.set(note.tick, tickTable.get(note.tick).concat(note))
        } else {
          tickTable.set(note.tick, [note])
        }
      })

    graphics.beginFill(COLORS.COLOR_STACKED, COLORS.ALPHA_STACKED)
    ;[...tickTable.entries()].forEach(([tick, notes]) => {
      const area: Map<number, number> = new Map()
      notes.forEach(({ lane, width }) => {
        for (let i = LANE_MIN; i < LANE_MAX + 1; i++) {
          if (i >= lane && i <= lane + width - 1) {
            area.set(i, (area.get(i) ?? 0) + 1)
          }
        }
      });

      const MARGIN_X = 10
      const MARGIN_Y = 8;

      const n = [...area.entries()]
        .filter(([, v]) => v > 1)
        .map(([k, ]) => k)
        .reduce((acc, cur) => {
          console.log({ acc, cur })
          let lastArray = acc[acc.length - 1]
          if (!lastArray || lastArray[lastArray.length - 1] + 1 !== cur) {
            lastArray = []
            acc.push(lastArray)
          }

          if (lastArray.length >= 2) {
            lastArray[1] = cur
          } else {
            console.log(typeof lastArray)
            lastArray.push(cur)
          }

          return acc
        }, [])

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
