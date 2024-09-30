<script lang="ts">
  import { COLORS, NOTE_HEIGHT, Z_INDEX } from '$lib/consts'

  // Functions
  import { position, PositionManager } from '$lib/position'
  import { getContext, onDestroy, onMount } from 'svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Note, Single, Slide } from '$lib/score/beatmap'
  import { preferences } from '$lib/preferences'

  // Props
  export let singles: Single[]
  export let slides: Slide[]

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Variables
  let graphics: PIXI.Graphics
  let time = 0

  onMount(() => {
    graphics = new PIXI.Graphics()
    graphics.zIndex = Z_INDEX.ERROR
    graphics.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
    mainContainer.addChild(graphics)
    app.ticker.add(changeAlpha)
  })

  onDestroy(() => {
    app.ticker.remove(changeAlpha)
    mainContainer.removeChild(graphics)
  })

  function changeAlpha(deltaT: number) {
    time += deltaT * 0.1
    graphics.alpha = 0.85 * Math.max(0, Math.sin(time) + 0.38196601125)
  }

  $: drawErrorAreas($position, singles, slides)

  function drawErrorArea(
    position: PositionManager,
    lane: number,
    laneR: number,
    tick: number,
  ) {
    const MARGIN_X = 10
    const MARGIN_Y = 8
    graphics.drawRoundedRect(
      position.calcX(lane) - 0.5 * MARGIN_X,
      position.calcY(tick) - 0.5 * NOTE_HEIGHT - 0.5 * MARGIN_Y,
      ((laneR ?? lane) - lane + 1) * $preferences.laneWidth + MARGIN_X,
      NOTE_HEIGHT + MARGIN_Y,
      5,
    )
  }

  function drawErrorAreas(
    position: PositionManager,
    singles: Single[],
    slides: Slide[],
  ) {
    if (!graphics) return

    graphics.removeChildren()
    graphics.clear()

    let tickTable = new Map<number, Note[]>()
    ;[
      ...singles,
      ...slides.flatMap(({ head, tail, steps }) => [head, tail, ...steps]),
    ].forEach((note) => {
      tickTable.set(note.tick, [...(tickTable.get(note.tick) ?? []), note])
    })

    // Draw multiple point warning
    if ($preferences.multiTapWarningEnabled) {
      for (const [tick, notes] of tickTable) {
        const judgementNotes = notes.filter(
          (note) =>
            singles.includes(note as Single) ||
            slides.some((slide) => slide.head === note || slide.tail === note),
        )
        if (judgementNotes.length >= 3) {
          for (const note of judgementNotes) {
            graphics.beginFill(COLORS.COLOR_WARNING, COLORS.ALPHA_WARNING)
            drawErrorArea(position, note.lane, note.lane + note.width - 1, tick)
            graphics.endFill()
          }
        }
      }
    }

    graphics.beginFill(COLORS.COLOR_STACKED, COLORS.ALPHA_STACKED)

    // Draw duplication and outside
    ;[...tickTable.entries()].forEach(([tick, notes]) => {
      const area: number[] = new Array(16).fill(0)
      area[0] = area[1] = area[14] = area[15] = 1 // Default 1 to outside area so if note exist it gets to 2 > 1
      notes.forEach(({ lane: laneL, width }) => {
        const laneR = laneL + width - 1
        for (let i = 0; i < 16; i++) {
          if (i >= laneL && i <= laneR) {
            area[i] += 1
          }
        }
      })

      const n = area
        .map((v, i) => (v > 1 ? i : undefined))
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

      // Draw
      n.forEach(([lane, laneR]) => {
        drawErrorArea(position, lane, laneR, tick)
      })
    })

    // Draw invalid steps
    slides.forEach(({ head, tail, steps }) => {
      // find duplicated step with the same tick
      const duplicatedSteps = steps
        .map((step, i) => [step, i] as [Note, number])
        .filter(([step, i]) =>
          steps.slice(i + 1).some((step2) => step.tick === step2.tick),
        )
        .map(([step]) => step)
      for (const step of duplicatedSteps) {
        drawErrorArea(
          position,
          step.lane,
          step.lane + step.width - 1,
          step.tick,
        )
      }

      for (const step of steps) {
        if (step.tick < head.tick || step.tick > tail.tick) {
          drawErrorArea(
            position,
            step.lane,
            step.lane + step.width - 1,
            step.tick
          )
        }
      }
    })

    graphics.endFill()

    graphics.beginFill(COLORS.COLOR_CORRUPUTED, COLORS.ALPHA_CORRUPUTED)

    // Draw invalid ticks (non-integer)
    for (const [tick, notes] of tickTable) {
      if (!Number.isInteger(tick)) {
        for (const note of notes) {
          drawErrorArea(position, note.lane, note.lane + note.width - 1, tick)
        }
      }
    }

    graphics.endFill()
  }
</script>
