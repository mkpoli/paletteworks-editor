<script lang="ts">
  // Imports
  import { COLORS, NOTE_HEIGHT, Z_INDEX } from '$lib/consts'
  import LL from '$i18n/i18n-svelte'
  import { position, PositionManager } from '$lib/position'
  import { getContext, onDestroy, onMount } from 'svelte'
  import type PIXI from 'pixi.js'
  import type { Note, Single, Slide } from '$lib/score/beatmap'
  import { preferences } from '$lib/preferences'
  import { dev } from '$app/env'
  import tippy, { type Instance as TippyInstance } from 'tippy.js'

  // Props
  export let singles: Single[]
  export let slides: Slide[]
  export let tooltipArea: HTMLElement

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')
  const mainContainer = getContext<PIXI.Container>('mainContainer')

  // Constants
  const TOOLTIP_MARGIN_X = 10
  const TOOLTIP_MARGIN_Y = 10

  // Variables
  let graphics: PIXI.Graphics
  let time = 0
  let errorAreas: ErrorArea[]

  let instance: TippyInstance
  onMount(() => {
    graphics = new PIXI.Graphics()
    graphics.zIndex = Z_INDEX.ERROR
    graphics.hitArea = new PIXI.Rectangle(0, 0, 0, 0)
    mainContainer.addChild(graphics)
    app.ticker.add(changeAlpha)

    instance = tippy(tooltipArea, {
      placement: 'right-start',
      trigger: 'manual',
      offset: [TOOLTIP_MARGIN_X, TOOLTIP_MARGIN_Y],
      delay: [500, 0],
      animation: 'fade',
      theme: 'tool-error',
    })

    tooltipArea.addEventListener('pointermove', (event) => {
      if (!instance) return

      const containerPosition = {
        x: tooltipArea.getBoundingClientRect().x,
        y: tooltipArea.getBoundingClientRect().y,
      }
      for (const errorArea of errorAreas) {
        const rect = getErrorAreaRectLocal(
          $position,
          errorArea.lane,
          errorArea.laneR,
          errorArea.tick,
        )

        const globalLeftTopPosition = graphics.toGlobal({
          x: rect.x,
          y: rect.y,
        })
        const globalRightBottomPosition = graphics.toGlobal({
          x: rect.x + rect.width,
          y: rect.y + rect.height,
        })

        const globalRect = new PIXI.Rectangle(
          globalLeftTopPosition.x,
          globalLeftTopPosition.y,
          globalRightBottomPosition.x - globalLeftTopPosition.x,
          globalRightBottomPosition.y - globalLeftTopPosition.y,
        )

        const pointerPosition = {
          x: event.clientX,
          y: event.clientY,
        }

        const pointerPositionAdjustedToContainer = {
          x: pointerPosition.x - containerPosition.x,
          y: pointerPosition.y - containerPosition.y,
        }

        const isOverErrorArea = globalRect.contains(
          pointerPositionAdjustedToContainer.x,
          pointerPositionAdjustedToContainer.y,
        )
        if (!isOverErrorArea) {
          // hide tooltip
          instance.hide()
          continue
        }

        instance.setContent(
          {
            stacked: $LL.editor.messages.noteError.stacked(),
            warning: $LL.editor.messages.noteError.warning(),
            corrupted: $LL.editor.messages.noteError.corrupted(),
          }[errorArea.type],
        )
        instance.show()
        instance.setProps({
          getReferenceClientRect: () =>
            new DOMRect(pointerPosition.x, pointerPosition.y, 0, 0),
        })
        break
      }
    })

    return () => {
      if (instance) {
        instance.destroy()
      }
    }
  })

  onDestroy(() => {
    app.ticker.remove(changeAlpha)
    mainContainer.removeChild(graphics)
  })

  function changeAlpha(deltaT: number) {
    time += deltaT * 0.1
    graphics.alpha = 0.85 * Math.max(0, Math.sin(time) + 0.38196601125)
  }

  type ErrorAreaType = 'warning' | 'stacked' | 'corrupted'
  type ErrorArea = { type: ErrorAreaType; lane: number; laneR: number; tick: number }
  $: errorAreas = calcErrorAreas($position, singles, slides)
  $: if (dev) {
    console.info('[NoteError] errorAreas', errorAreas)
  }
  $: drawErrorAreas($position, errorAreas)

  function getErrorAreaRectLocal(
    position: PositionManager,
    lane: number,
    laneR: number,
    tick: number,
  ): PIXI.Rectangle {
    const MARGIN_X = 10
    const MARGIN_Y = 8
    return new PIXI.Rectangle(
      position.calcX(lane) - 0.5 * MARGIN_X,
      position.calcY(tick) - 0.5 * NOTE_HEIGHT - 0.5 * MARGIN_Y,
      ((laneR ?? lane) - lane + 1) * $preferences.laneWidth + MARGIN_X,
      NOTE_HEIGHT + MARGIN_Y,
    )
  }

  function calcErrorAreas(
    position: PositionManager,
    singles: Single[],
    slides: Slide[],
  ): ErrorArea[] {
    const errorAreas: ErrorArea[] = []

    let tickTable = new Map<number, Note[]>()
    ;[
      ...singles,
      ...slides.flatMap(({ head, tail, steps }) => [head, tail, ...steps]),
    ].forEach((note) => {
      tickTable.set(note.tick, [...(tickTable.get(note.tick) ?? []), note])
    })

    // Multiple point warning
    if ($preferences.multiTapWarningEnabled) {
      for (const [tick, notes] of tickTable) {
        const judgementNotes = notes.filter(
          (note) =>
            singles.includes(note as Single) ||
            slides.some((slide) => slide.head === note || slide.tail === note),
        )
        if (judgementNotes.length >= 3) {
          for (const note of judgementNotes) {
            errorAreas.push({
              type: 'warning',
              lane: note.lane,
              laneR: note.lane + note.width - 1,
              tick,
            })
          }
        }
      }
    }

    // Duplication and outside
    for (const [tick, notes] of tickTable) {
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

      const stackedAreas = area
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

      stackedAreas.forEach(([lane, laneR]) => {
        errorAreas.push({ type: 'stacked', lane, laneR: laneR ?? lane, tick })
      })
    }

    // Invalid steps
    slides.forEach(({ head, tail, steps }) => {
      const duplicatedSteps = steps
        .map((step, i) => [step, i] as [Note, number])
        .filter(([step, i]) =>
          steps.slice(i + 1).some((step2) => step.tick === step2.tick),
        )
        .map(([step]) => step)

      for (const step of duplicatedSteps) {
        errorAreas.push({
          type: 'stacked',
          lane: step.lane,
          laneR: step.lane + step.width - 1,
          tick: step.tick,
        })
      }

      for (const step of steps) {
        if (step.tick < head.tick || step.tick > tail.tick) {
          errorAreas.push({
            type: 'warning',
            lane: step.lane,
            laneR: step.lane + step.width - 1,
            tick: step.tick,
          })
        }
      }
    })

    // Invalid ticks (non-integer)
    for (const [tick, notes] of tickTable) {
      if (!Number.isInteger(tick)) {
        for (const note of notes) {
          errorAreas.push({
            type: 'corrupted',
            lane: note.lane,
            laneR: note.lane + note.width - 1,
            tick,
          })
        }
      }
    }

    return errorAreas
  }

  function drawErrorAreas(position: PositionManager, errorAreas: ErrorArea[]) {
    if (!graphics) return

    graphics.removeChildren()
    graphics.clear()

    for (const { type, lane, laneR, tick } of errorAreas) {
      switch (type) {
        case 'warning':
          graphics.beginFill(COLORS.COLOR_WARNING, COLORS.ALPHA_WARNING)
          break
        case 'stacked':
          graphics.beginFill(COLORS.COLOR_STACKED, COLORS.ALPHA_STACKED)
          break
        case 'corrupted':
          graphics.beginFill(COLORS.COLOR_CORRUPTED, COLORS.ALPHA_CORRUPTED)
          break
      }

      const rect = getErrorAreaRectLocal(position, lane, laneR, tick)

      graphics.drawRoundedRect(rect.x, rect.y, rect.width, rect.height, 5)
      graphics.endFill()
    }
  }
</script>

<style>
  :global(.tippy-box[data-theme~='tool-error']) {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      122deg,
      /* rgba(255, 65, 169, 0.65) 0%, */
        /* TODO: Select a good warning gradient color (redish) that seems dangerous */
        rgba(255, 59, 48, 0.65) 0%,
      rgba(255, 0, 0, 0.65) 100%
    );
    box-shadow: 0 3px 12px rgba(64, 0, 0, 0.5);
    font-weight: bold;
    padding: 0.4em 0.5em;
    border-radius: 0.5em;
    backdrop-filter: blur(4px);
  }
</style>
