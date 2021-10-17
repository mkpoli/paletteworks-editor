<script lang="ts">
  import type PIXI from 'pixi.js'
  import type { Mode } from '$lib/editing'
  import type { Flick, Single, Slide as SlideType } from '$lib/score/beatmap';

  import { calcLaneTick, calcX, calcY } from '$lib/timing'
  import { Pixi, Graphics } from 'svelte-pixi'
  import { LANE_WIDTH } from '$lib/consts'
  import { drawBackground, drawBPMs, drawSnappingElements, drawPlayhead } from '$lib/render/renderer';
  import { FLICK_TYPES } from '$lib/score/beatmap'
  import { closest, rotateNext } from '$lib/basic/collections'
  import { dbg, formatPoint } from '$lib/basic/debug'

  // Notes
  import Note from '$lib/render/Note.svelte'
  import Arrow from '$lib/render/Arrow.svelte'
  import Slide from '$lib/render/Slide.svelte'
  import { dbg, formatPoint } from './basic/debug'

  export let app: PIXI.Application
  export let PIXI: typeof import('pixi.js')
  export let measureHeight: number
  export let currentTick: number
  export let maxTick: number
  export let maxMeasure: number
  export let pointerLane: number
  export let pointerTick: number
  export let currentMode: Mode
  export let innerHeight: number

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
  onMount(() => {
    app.renderer.view.addEventListener('click', async () => {
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

    app.renderer.view.addEventListener('pointerdown', async () => {
      if (currentMode === 'slide') {
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
      }
    })

    app.stage.addListener('pointermove', (event: PIXI.InteractionEvent) => {
      pointer = event.data.global;

      ({ lane: pointerLane, tick: pointerTick } = calcLaneTick(
        pointer, snapTo, measureHeight, scrollTick, maxMeasure
      ))

      if (currentMode === 'slide' && dragging && draggingSlide) {
        draggingSlide.end.lane = pointerLane
        draggingSlide.end.tick = pointerTick
        slides = slides
      }
    })

    app.renderer.view.addEventListener('pointerup', async () => {
      if (currentMode === 'slide' && dragging && draggingSlide) {
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
        dragging = false
        draggingSlide = null
      } 
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
      drawPlayhead(graphics, PIXI, calcY(currentTick, measureHeight))
    }}
  />

  <!-- BACKGROUND -->
  <Graphics
    draw={(graphics) => { drawBackground(PIXI, graphics, measureHeight, calcY(maxTick, measureHeight), maxMeasure, innerHeight) }}
  />

  <!-- BPM -->
  <Graphics
    draw={(graphics) => { drawBPMs(graphics, PIXI, bpms, measureHeight) }}
  />

  <!-- SINGLE NOTES -->
  {#each singles as { lane, tick, width, critical, flick }}
    <Note
      type={
        critical
          ? 'critical'
          : flick !== 'no'
            ? 'flick'
            : 'tap'
          }
      {...{ lane, tick, width, measureHeight }}
    />
  {/each}

  <!-- SLIDE NOTES -->
  {#each slides as slide}
    <Slide {slide} {measureHeight} />
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
        calcX(pointerLane) + LANE_WIDTH, calcY(pointerTick, measureHeight),
        bpms.has(pointerTick)
      )
    }}
  />
</Pixi>