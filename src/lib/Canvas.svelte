<script lang="ts">
  import type PIXI from 'pixi.js'
  import type { Mode } from '$lib/editing'
  import type { Flick, Single, Slide as SlideType, Note as NoteType } from '$lib/score/beatmap';

  import { createEventDispatcher, getContext, onMount, setContext } from 'svelte'
  import { Pixi, Graphics } from 'svelte-pixi'
  import { LANE_WIDTH } from '$lib/consts'
  import { drawSnappingElements, drawPlayhead } from '$lib/render/renderer';
  import { FLICK_TYPES } from '$lib/score/beatmap'
  import { closest, rotateNext } from '$lib/basic/collections'
  import { dbg, formatPoint } from '$lib/basic/debug'
  import { selectedNotes } from '$lib/selection'

  // Background
  import Background from '$lib/render/Background.svelte'
  import BPM from '$lib/render/BPM.svelte'

  // Notes
  import Note from '$lib/render/Note.svelte'
  import Arrow from '$lib/render/Arrow.svelte'
  import Slide from '$lib/render/Slide.svelte'
  import Selection from '$lib/render/Selection.svelte'

  export let app: PIXI.Application
  export let PIXI: typeof import('pixi.js')
  export let measureHeight: number
  export let currentTick: number
  export let maxMeasure: number
  export let snapTo: number
  export let scrollTick: number
  export let currentMode: Mode
  export let innerHeight: number

  setContext('app', app)

  let pointA: PIXI.Point = new PIXI.Point(300, 800)
  let pointB: PIXI.Point = new PIXI.Point(400, 500)

  $: pointA && dbg('selectA', formatPoint(pointA.x, pointA.y))
  $: pointB && dbg('selectB', formatPoint(pointB.x, pointB.y))


  import { PositionManager, position } from '$lib/position'
  let pointer: PIXI.Point
  let pointerLane: number
  let pointerTick: number
  $: $position = new PositionManager(measureHeight, scrollTick, snapTo, innerHeight)
  $: if (pointer) {
    pointerLane = $position.calcLane(pointer.x)
    pointerTick = $position.calcTick(pointer.y)
  }
  $: dbg('iH - p.y', innerHeight - pointer?.y)
  $: pointer && dbg('pointer', formatPoint(pointer.x, pointer.y))
  $: dbg('pointer(Lane, Tick)', formatPoint(pointerLane, pointerTick))
  
  function point2rect(pointA: PIXI.Point, pointB: PIXI.Point) {
    const 左 = Math.min(pointA.x, pointB.x)
    const 右 = Math.max(pointA.x, pointB.x)
    const 上 = Math.min(pointA.y, pointB.y)
    const 下 = Math.max(pointA.y, pointB.y)

    return new PIXI.Rectangle(
      左, 上, 右 - 左, 下 - 上
    )
  }

  $: selectRect = point2rect(pointA, pointB)

  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')

  export let singles: Single[]
  export let slides: SlideType[]
  export let bpms: Map<number, number>

  const dispatch = createEventDispatcher<{
    changeBPM: { tick: number, bpm: number },
    playSound: string
  }>()
  let dragging: boolean = false
  let draggingSlide: SlideType = null
  $: if (currentMode) {
    dragging = false
    draggingSlide = null
  }

  onMount(() => {
    app.stage.sortableChildren = true
    app.renderer.view.addEventListener('click', () => {
      if (currentMode === 'bpm') {
        dispatch('changeBPM', {
          tick: pointerTick,
          bpm: bpms.get(pointerTick) || bpms.get(closest([...bpms.keys()], pointerTick, true))
        })
        return
      }

      if (currentMode === 'tap') {
        singles.push({
          lane: pointerLane,
          tick: pointerTick,
          width: 2,
          critical: false,
          flick: 'no'
        })
        singles = singles
        dispatch('playSound', 'stage')
        return
      }

      const singleHere = singles.find((single) => (
          single.tick === pointerTick &&
          single.lane <= pointerLane && pointerLane <= single.lane + single.width
        )
      )

      if (currentMode === 'flick') {
        if (singleHere) {
          singleHere.flick = rotateNext<Flick>(singleHere.flick, FLICK_TYPES)
          singles = singles
          dispatch('playSound', 'stage')
          return
        }

        const slideEndHere = slides.find((slide) => (
          slide.end.tick === pointerTick &&
          slide.end.lane <= pointerLane && pointerLane <= slide.end.lane + slide.end.width
        ))
        if (slideEndHere) {
          slideEndHere.end.flick = rotateNext<Flick>(slideEndHere.end.flick, FLICK_TYPES)
          slides = slides
          dispatch('playSound', 'stage')
        }
        return
      }

      if (currentMode === 'critical') {
        if (singleHere) {
          singleHere.critical = !singleHere.critical
          singles = singles
          dispatch('playSound', 'stage')
          return
        }

        const slideHere = slides.find((slide) => {
          return (
            slide.start.tick === pointerTick &&
            slide.start.lane <= pointerLane && pointerLane <= slide.start.lane + slide.start.width
          ) || (
            slide.end.tick === pointerTick &&
            slide.end.lane <= pointerLane && pointerLane <= slide.end.lane + slide.end.width
          )
        })

        if (slideHere) {
          slideHere.critical = !slideHere.critical
          slides = slides
          dispatch('playSound', 'stage')
          return
        }
      }
    })

    app.renderer.view.addEventListener('pointerdown', (event: PointerEvent) => {
      if (event.button == 2) return
      app.renderer.view.setPointerCapture(event.pointerId)
      switch (currentMode) {
        case 'select': {
          dragging = true

          pointA = new PIXI.Point(pointer.x, pointer.y + app.stage.pivot.y)
          pointB = new PIXI.Point(pointer.x, pointer.y + app.stage.pivot.y)
          selectedNotes.set([])
          break
        }
        case 'slide': {
          dragging = true
          draggingSlide = {
            start: {
              tick: pointerTick,
              lane: pointerLane,
              width: 2,
              easeType: false
            },
            end: {
              tick: pointerTick,
              lane: pointerLane,
              flick: 'no',
              width: 2
            },
            critical: false,
            steps: []
          }
          slides.push(draggingSlide)
          slides = slides
          dispatch('playSound', 'stage')
          break
        }
      }
    })



    app.stage.addListener('pointermove', (event: PIXI.InteractionEvent) => {
      pointer = event.data.global

      if (!dragging) {
        return
      }
      switch (currentMode) {
        case 'select': {
          pointB = new PIXI.Point(pointer.x, pointer.y + app.stage.pivot.y)
          break
        }
        case 'slide': {
          draggingSlide.end.lane = pointerLane
          draggingSlide.end.tick = pointerTick
          slides = slides
          break
        }
      }
    })

    function calcSelection(): NoteType[] {
      return [
        ...singles.filter(({ tick, lane }) => $position.inRect(lane, tick, selectRect)),
        ...slides
          .map(({ start, end, steps }) => [start, end, ...steps])
          .flat()
          .filter(({ lane, tick }) => $position.inRect(lane, tick, selectRect))
      ]
    }

    app.renderer.view.addEventListener('pointerup', (event: PointerEvent) => {
      if (!dragging) {
        return
      }
      app.renderer.view.releasePointerCapture(event.pointerId)
      switch (currentMode) {
        case 'select': {
          selectedNotes.set(calcSelection())
          console.log({ selectedNotes })
          break
        }
        case 'slide': {
          if (draggingSlide.end.tick < draggingSlide.start.tick) {
            // Swap
            const tick = draggingSlide.start.tick
            const lane = draggingSlide.start.lane
            // TODO: width
            draggingSlide.start.tick = draggingSlide.end.tick
            draggingSlide.start.lane = draggingSlide.end.lane
            draggingSlide.end.tick = tick
            draggingSlide.end.lane = lane
          }
          slides = slides
          draggingSlide = null
          break
        }
      }
      dragging = false
    })

    // app.renderer.view.addEventListener('dblclick', () => {
    //   if (currentMode === 'bpm') {
    //     bpms.delete(pointerTick)
    //     bpms = bpms
    //     return
    //   }

    //   if (currentMode === 'select') {
    //     const singleHere = singleNotes.find((single) => (
    //           single.tick === pointerTick &&
    //           single.lane <= pointerLane && pointerLane <= single.lane + single.width
    //       )
    //     )
    //     if (singleHere) {
    //       singleNotes.splice(singleNotes.indexOf(singleHere), 1)
    //       singleNotes = singleNotes
    //       return
    //     }
    //   }
    // })
  })
</script>

<Pixi {app}>
  <!-- PLAYHEAD -->
  <Graphics
    draw={(graphics) => {
      drawPlayhead(graphics, PIXI, $position.calcY(currentTick))
    }}
  />

  <!-- BACKGROUND -->
  <Background
    {maxMeasure}
  />

  <!-- BPM -->
  <BPM
    {bpms}
  />

  <!-- SINGLE NOTES -->
  {#each singles as note}
    <Note {note}/>
  {/each}

  <!-- SLIDE NOTES -->
  {#each slides as slide}
    <Slide {slide} />
  {/each}

  <!-- FLICK ARROW -->
  {#each singles as { lane, tick, width, critical, flick }}
    {#if flick !== 'no'}
      <Arrow
        {...{ lane, tick, width, critical, flick, measureHeight }}
      />
    {/if}
  {/each}
  {#each slides as { end: { lane, tick, width, flick }, critical }}
    {#if flick !== 'no'}
      <Arrow
        {...{ lane, tick, width, critical, flick, measureHeight }}
      />
    {/if}
  {/each}

  <!-- FLOATING ITEMS -->
  <Graphics
    draw={(graphics) => {
      drawSnappingElements(
        graphics, PIXI, TEXTURES, currentMode,
        $position.calcX(pointerLane) + LANE_WIDTH, $position.calcY(pointerTick),
        bpms.has(pointerTick)
      )
    }}
  />

  <Selection
    {dragging}
    rect={selectRect}
  />
</Pixi>

<svelte:window
  on:keydown={(event) => {
    if (event.key == 'Delete') {
      $selectedNotes.forEach((note) => {
        singles = singles.filter((item) => item !== note)
        slides = slides.filter(({ start, end }) => start !== note && end !== note)
        slides.forEach((slide) => {
            slide.steps = slide.steps.filter((item) => item !== note)
          })
      })
    }
  }}
></svelte:window>