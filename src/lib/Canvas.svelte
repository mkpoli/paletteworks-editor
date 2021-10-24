<script lang="ts">
  import type PIXI from 'pixi.js'
  import type { Mode } from '$lib/editing'
  import type { Flick, Single, Slide as SlideType, Note as NoteType } from '$lib/score/beatmap';

  import { createEventDispatcher, onMount, setContext } from 'svelte'
  import { ZOOM_MIN, ZOOM_MAX } from '$lib/consts'
  import { FLICK_TYPES } from '$lib/score/beatmap'
  import { closest, rotateNext } from '$lib/basic/collections'
  import { dbg, formatPoint } from '$lib/basic/debug'
  import { selectedNotes } from '$lib/selection'

  // Score Components
  import Background from '$lib/render/Background.svelte'
  import BPM from '$lib/render/BPM.svelte'
  import Playhead from '$lib/render/Playhead.svelte'
  import Note from '$lib/render/Note.svelte'
  import Slide from '$lib/render/Slide.svelte'
  import Selection from '$lib/render/Selection.svelte'
  import Floating from './render/Floating.svelte'

  // UI Components
  import Menu from '$lib/ui/Menu.svelte'
  import MenuItem from '$lib/ui/MenuItem.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'
  import ZoomIndicator from '$lib/ZoomIndicator.svelte'
  import ImageDialog from '$lib/dialogs/ImageDialog.svelte'

  export let app: PIXI.Application
  export let PIXI: typeof import('pixi.js')
  export let measureHeight: number
  export let currentTick: number
  export let maxMeasure: number
  export let snapTo: number
  export let scrollTick: number
  export let currentMode: Mode
  export let innerHeight: number
  export let zoom: number
  export let imageDialogOpened: boolean
  export let visibility: Record<string, boolean>

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
    pointerTick = $position.calcTick(pointer.y, scrollTick)
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

  export let singles: Single[]
  export let slides: SlideType[]
  export let bpms: Map<number, number>

  const dispatch = createEventDispatcher<{
    changeBPM: { tick: number, bpm: number },
    playSound: string,
    delete: void
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
    })

    app.renderer.view.addEventListener('pointerdown', (event: PointerEvent) => {
      if (event.button == 2) return
      app.renderer.view.setPointerCapture(event.pointerId)
      switch (currentMode) {
        case 'select': {
          dragging = true

          pointA = new PIXI.Point(pointer.x, pointer.y + app.stage.pivot.y)
          pointB = new PIXI.Point(pointer.x, pointer.y + app.stage.pivot.y)

          if (!event.shiftKey) {
            selectedNotes.set([])
          }
          break
        }
        case 'slide': {
          dragging = true
          draggingSlide = {
            head: {
              tick: pointerTick,
              lane: pointerLane,
              width: 2,
              easeType: false
            },
            tail: {
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
          draggingSlide.tail.lane = pointerLane
          draggingSlide.tail.tick = pointerTick
          slides = slides
          break
        }
      }
    })

    function calcSelection(): NoteType[] {
      return [
        ...singles.filter(({ tick, lane, width }) => $position.intersectRect(lane, width, tick, selectRect)),
        ...slides
          .map(({ head, tail, steps }) => [head, tail, ...steps])
          .flat()
          .filter(({ lane, width, tick }) => $position.intersectRect(lane, width, tick, selectRect))
      ]
    }

    app.renderer.view.addEventListener('pointerup', (event: PointerEvent) => {
      if (!dragging) {
        return
      }
      app.renderer.view.releasePointerCapture(event.pointerId)
      switch (currentMode) {
        case 'select': {
          $selectedNotes = $selectedNotes.concat(calcSelection())
          break
        }
        case 'slide': {
          if (draggingSlide.tail.tick < draggingSlide.head.tick) {
            // Swap
            const tick = draggingSlide.head.tick
            const lane = draggingSlide.head.lane
            // TODO: width
            draggingSlide.head.tick = draggingSlide.tail.tick
            draggingSlide.head.lane = draggingSlide.tail.lane
            draggingSlide.tail.tick = tick
            draggingSlide.tail.lane = lane
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

    canvasContainer.appendChild(app.view)
  })

  let menu: HTMLDivElement

  let canvasContainer: HTMLDivElement
</script>

<div
  class="canvas-container"
>
  <div
    bind:this={canvasContainer}
  >
    <!-- PLAYHEAD -->
    <Playhead
      {currentTick}
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
    {#each singles as note (note)}
      {#if visibility.Flicks && note.flick !== 'no' || visibility.Taps && note.flick === 'no' }
        <Note {note} on:click={() => {
          switch (currentMode) {
            case 'flick': {
              note.flick = rotateNext(note.flick, FLICK_TYPES)
              singles = singles
              dispatch('playSound', 'stage')
              break
            }
            case 'critical': {
              note.critical = !note.critical
              singles = singles
              dispatch('playSound', 'stage')
              return
            }
          }
        }}/>
      {/if}
    {/each}

    <!-- SLIDE NOTES -->
    {#if visibility.Slides}
      {#each slides as slide (slide)}
        <Slide {slide} stepsVisible={visibility.SlideSteps} on:click={() => {
          switch (currentMode) {
            case 'flick': {
              slide.tail.flick = rotateNext(slide.tail.flick, FLICK_TYPES)
              slides = slides
              dispatch('playSound', 'stage')
              break
            }
            case 'critical': {
              slide.critical = !slide.critical
              slides = slides
              dispatch('playSound', 'stage')
              return
            }
          }
        }}/>
      {/each}
    {/if}

    <!-- FLOATING ITEMS -->
    <Floating
      {pointerLane}
      {pointerTick}
      {bpms}
      {currentMode}
      {pointer}
    />

    <Selection
      {dragging}
      rect={selectRect}
    />
  </div>
  <div class="zoom-indicator-container">
    <ZoomIndicator bind:zoom min={ZOOM_MIN} max={ZOOM_MAX} step={0.1} />
  </div>
</div>

<!-- CONTEXT MENU -->
<Menu bind:menu>
  <MenuTrigger contextArea={canvasContainer} {menu} slot="trigger" ></MenuTrigger>
  {#if $selectedNotes.length}
    <MenuItem icon="mdi:delete" text="削除" on:click={() => dispatch('delete')} />
  {/if}
</Menu>

<!-- EXPORT IMAGE DIALOG -->
<ImageDialog
  bind:opened={imageDialogOpened}
  {maxMeasure}
/>

<svelte:window
  on:keydown={(event) => {
    if (event.key == 'Delete') {
      dispatch('delete')
    }
  }}
></svelte:window>

<style>
  .canvas-container {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: hidden;
    display: grid;
    grid-template-columns: 1fr auto;
    position: relative;
    background: linear-gradient(180deg, rgb(11.24% 0% 29.08%) 0%, rgb(6.27% 0% 14.83%) 100%);
  }

  .zoom-indicator-container {
    height: 100%;
    padding: 1em;
    display: flex;    
    flex-direction: column;
    justify-content: end;
  }
</style>