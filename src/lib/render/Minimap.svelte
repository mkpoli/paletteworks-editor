<script lang="ts">
  // Types
  import type PIXI from 'pixi.js'

  // Functions
  import { getContext, onDestroy, onMount, createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher<{
    scroll: number  
  }>()

  // Contexts
  const app = getContext<PIXI.Application>('app')
  const PIXI = getContext<typeof import('pixi.js')>('PIXI')

  // Stores
  import { position, type PositionManager } from '$lib/position'
  import { scrollY } from '$lib/editing/scrolling'

  // Props
  export let maxMeasure: number
  export let singles: Single[]
  export let slides: Slide[]
  export let timeSignatures: Map<number, [number, number]>

  // Variables
  let container: PIXI.Container
  let instance: MinimapRenderer

  // Constants
  import {
    COLORS,
    MAIN_WIDTH,
    MARGIN_BOTTOM,
    MINIMAP_RESOLUTION,
    MINIMAP_WIDTH,
    SCROLLBAR_WIDTH,
    TICK_PER_BEAT,
    TICK_PER_MEASURE,
    Z_INDEX,
  } from '$lib/consts'
  import type {
    ICritical,
    IDirectional,
    IEase,
    SlideNote,
    Note,
    Single,
    Slide,
    Type,
  } from '$lib/score/beatmap'
  import { calcType } from '$lib/score/beatmap'

  // Functions
  import { preferences } from '$lib/preferences'
  import { easeInQuad, easeOutQuad, lerp } from '$lib/basic/math'
  import { calcNoteHeight } from './note'

  $: minimapRect = new PIXI.Rectangle(
    $position.containerWidth - SCROLLBAR_WIDTH - MINIMAP_WIDTH,
    0,
    MINIMAP_WIDTH,
    0.5 * $position.containerHeight
  )

  onMount(() => {
    container = new PIXI.Container()
  
    container.interactive = true
    container.zIndex = Z_INDEX.MINIMAP
    container.addEventListener('click', (event) => {
      const tick = $position.calcRawTick2((event.global.y - instance.y) / MINIMAP_RESOLUTION + $scrollY)
      dispatch('scroll', tick)
    })

    instance = new MinimapRenderer()
    container.addChild(instance)
    
    app.stage.addChild(container)
  })

  onDestroy(() => {
    app.stage.removeChild(container)
  })

  class MinimapNoteRenderer extends PIXI.Graphics {
    arrows: (Note & IDirectional & ICritical)[] = []

    drawArrow(position: PositionManager, note: Note & IDirectional & ICritical) {
      const x = position.calcFixedMidX(note.lane, note.width)
      const y = position.calcY(note.tick) - calcNoteHeight() / 2
      this.lineStyle(15, 'critical' in note && note.critical ? 0xf8be3a : 0xee7f9e)
  
      switch (note.flick) {
        case 'left':
          this.moveTo(x - 25, y - 5)
          this.lineTo(x - 10, y - 30)
          this.lineTo(x + 25, y - 15)
          break
        case 'right':
          this.moveTo(x - 25, y - 15)
          this.lineTo(x + 10, y - 30)
          this.lineTo(x + 25, y - 5)
          break
        case 'middle':
          this.moveTo(x - 25, y - 10)
          this.lineTo(x, y - 30)
          this.lineTo(x + 25, y - 10)
          break
      }
    }

    drawNote(position: PositionManager, note: Note, type: Type) {
      switch (type) {
        case 'tap':
          this.beginFill(0xe6edff)
          this.lineStyle(6, 0x8494f6)
          break
        case 'critical':
          this.beginFill(0xfffccc)
          this.lineStyle(6, 0xfeb94b)
          break
        case 'flick':
          this.beginFill(0xffeef2)
          this.lineStyle(6, 0xf89cab)
          break
        case 'slide':
          this.beginFill(0xdafdf1)
          this.lineStyle(6, 0x5be29d)
          break
      }

      const height = calcNoteHeight()

      this.drawRoundedRect(
        position.calcFixedX(note.lane),
        position.calcY(note.tick) - height / 2,
        $preferences.laneWidth * note.width,
        height,
        10
      )
      this.endFill()

      if ('flick' in note && note.flick !== 'no') {
        const { lane, tick, width, flick } = note

        this.arrows.push({
          lane,
          tick,
          width,
          flick,
          critical: type === 'critical',
        })
      }
    }

    drawPath(notes: SlideNote[], critical: boolean) {
      notes.pairwise().forEach(([origin, target]) => {
        const origin_x_left = $position.calcFixedX(origin.lane)
        const origin_x_right = $position.calcFixedX(origin.lane) + origin.width * $preferences.laneWidth
        const origin_y = $position.calcY(origin.tick)

        const target_x_left = $position.calcFixedX(target.lane)
        const target_x_right = $position.calcFixedX(target.lane) + target.width * $preferences.laneWidth
        const target_y = $position.calcY(target.tick)

        const STEPS = Math.ceil((origin_y - target_y) / 10)

        const pointsL = []
        const pointsR = []

        if ((origin as IEase).easeType) {
          for (let i = 1; i < STEPS - 1; i++) {
            const percentage = i / STEPS
            const xL = lerp(
              target_x_left,
              origin_x_left,
              ((origin as IEase).easeType === 'easeIn' ? easeOutQuad : easeInQuad)(percentage)
            )
            const xR = lerp(
              target_x_right,
              origin_x_right,
              ((origin as IEase).easeType === 'easeIn' ? easeOutQuad : easeInQuad)(percentage)
            )
            const y = lerp(target_y, origin_y, percentage)
            pointsL.push([xL, y])
            pointsR.push([xR, y])
          }
        }

        if (critical) {
          this.beginFill(COLORS.COLOR_SLIDE_PATH_CRITICAL, COLORS.ALPHA_SLIDE_PATH)
        } else {
          this.beginFill(COLORS.COLOR_SLIDE_PATH, COLORS.ALPHA_SLIDE_PATH)
        }
        this.lineStyle(0)
        this.lineTo(target_x_left, target_y)
        this.moveTo(target_x_right, target_y)
        for (const [x, y] of pointsR) {
          this.lineTo(x, y)
        }
        this.lineTo(origin_x_right, origin_y)
        this.lineTo(origin_x_left, origin_y)
        for (const [x, y] of pointsL.reverse()) {
          this.lineTo(x, y)
        }
        this.lineTo(target_x_left, target_y)
        this.closePath()
      })
    }

    drawNotes(position: PositionManager, singles: Single[], slides: Slide[]) {
      this.clear()
      this.arrows = []
      singles.forEach((note: Single) => {
        const { critical, flick } = note
        this.drawNote(position, note, calcType(critical, flick, false))
      })
      slides.forEach((slide: Slide) => {
        const { critical, head, tail, steps } = slide

        this.drawPath([head, ...steps.filter((x) => !x.ignored), tail], critical)
        this.drawNote(position, head, calcType(critical, 'no', true))
        this.drawNote(position, tail, calcType(critical || tail.critical, tail.flick, true))
      })
      this.arrows.forEach(arrow => this.drawArrow(position, arrow))
    }
  }

  class MinimapRenderer extends PIXI.Container {
    notes: MinimapNoteRenderer
    grid: PIXI.Graphics
    screenArea: PIXI.Graphics
    constructor() {
      super()

      this.scale.x = MINIMAP_RESOLUTION
      this.scale.y = MINIMAP_RESOLUTION

      this.mask = new PIXI.Graphics()

      this.screenArea = new PIXI.Graphics()
      this.addChild(this.screenArea)

      this.notes = new MinimapNoteRenderer()
      this.addChild(this.notes)

      this.grid = new PIXI.Graphics()
      this.addChild(this.grid)
    }

    updateMask(rect: PIXI.Rectangle) {
      const mask = this.mask as PIXI.Graphics
      mask.clear()
      mask.beginFill(0xffffff)
      mask.drawRect(rect.x, rect.y, rect.width, rect.height)
    }

    drawScreenArea(position: PositionManager, scrollY: number) {
      this.screenArea.clear()
      this.screenArea.beginFill(0xffffff, 0.1)
      this.screenArea.drawRect(
        0,
        scrollY,
        position.calcLeft() + MAIN_WIDTH,
        position.containerHeight
      )
      this.screenArea.endFill()
    }

    drawGrid(position: PositionManager) {
      const left = position.calcFixedX(1)

      this.grid.clear()
      // Draw beat / measures
      let accumulatedTicks = 0;
      [...timeSignatures].forEach(([measure, [p, q]], ind, arr) => {
        const beatsPerMeasure = (p / q) * 4

        const [nextMeasure] = arr[ind + 1] ?? [maxMeasure + 1]
        const startTick = accumulatedTicks
        accumulatedTicks += (nextMeasure - measure) * beatsPerMeasure * TICK_PER_BEAT

        for (let tick = 0; tick < (nextMeasure - measure) * beatsPerMeasure * TICK_PER_BEAT; tick++) {
          const y = position.calcY(startTick + tick)
          if (tick % (beatsPerMeasure * TICK_PER_BEAT) === 0) {
            this.grid.lineStyle(2, COLORS.COLOR_BAR_PRIMARY, 1, 0.5)
            this.grid.moveTo(left, y)
            this.grid.lineTo(left + position.laneAreaWidth, y)
          }
        }
      })

      // Draw lanes
      for (let i = 1; i < 14; i++) {
        const x = left + i * $preferences.laneWidth
        if (i % 2 !== 0) {
          this.grid.lineStyle(2, COLORS.COLOR_LANE_PRIMARY, 1, 0.5)
          this.grid.moveTo(x, position.calcY(0) + MARGIN_BOTTOM)
          this.grid.lineTo(x, position.calcY(maxMeasure * TICK_PER_MEASURE) - MARGIN_BOTTOM)
        }
      }
    }
  }

  $: if (container && minimapRect) container.hitArea = minimapRect
  $: if (instance && minimapRect) instance.updateMask(minimapRect)
  $: if (instance) instance.notes.drawNotes($position, singles, slides)
  $: if (instance) instance.drawGrid($position)
  $: if (instance) instance.pivot.y = $scrollY - MARGIN_BOTTOM + 30
  $: if (instance) instance.drawScreenArea($position, $scrollY)
  $: if (instance) instance.x = $position.containerWidth - MINIMAP_WIDTH
  $: if (instance) instance.y = $position.containerHeight / 8 - 0.01 * $scrollY * 1 / $position.zoom
</script>
