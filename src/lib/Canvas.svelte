<script lang="ts">
  import type PIXI from 'pixi.js'
  import type { Mode } from '$lib/editing/modes'
  import type { Single, Slide as SlideType, Note as NoteType, SlideStep, EaseType, IEase, DiamondType } from '$lib/score/beatmap'

  import { createEventDispatcher, onMount, setContext } from 'svelte'
  import { ZOOM_MIN, ZOOM_MAX, LANE_MAX } from '$lib/consts'
  import { FLICK_TYPES } from '$lib/score/beatmap'
  import { closest, rotateNext } from '$lib/basic/collections'
  import { dbg, formatPoint } from '$lib/basic/debug'
  import { selectedNotes } from '$lib/editing/selection'

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
  import MenuDivider from './ui/MenuDivider.svelte'
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

  import { PositionManager, position, pointer, cursor } from '$lib/position'
  $: $position = new PositionManager(measureHeight, scrollTick, snapTo, innerHeight)
  $: $cursor = {
    lane: $position.calcLane($pointer.x),
    tick: $position.calcTick($pointer.y, scrollTick),
  }
  $: dbg('pointer', formatPoint($pointer.x, $pointer.y))
  $: dbg('cursor', formatPoint($cursor.lane, $cursor.tick))
  
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
    delete: void,
    copy: void,
    cut: void,
    paste: void,
    movestart: void,
    move: void
    moveend: void,
    changecurve: {
      note: IEase,
      type: EaseType
    },
    changediamond: {
      note: SlideStep,
      type: DiamondType
    },
    selectsingle: {
      note: NoteType
    }
  }>()
  let dragging: boolean = false
  let draggingSlide: SlideType = null
  $: if (currentMode) {
    dragging = false
    draggingSlide = null
  }
  let shiftKey: boolean = false
  $: dbg('shiftKey', shiftKey)
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    shiftKey = event.shiftKey
  })
  document.addEventListener('keyup', (event: KeyboardEvent) => {
    shiftKey = event.shiftKey
  })

  import { moving } from './editing/moving'
  $: dbg('moving', $moving)

  import moveCursor from '$assets/move-cursor.png'
  import resizeCursor from '$assets/resize-cursor.png'
  import selectCursor from '$assets/select-cursor.png'

  import { clipboardSingles } from './editing/clipboard'

  const myCursorStyle = {
    move: `url(${moveCursor}) 16 16, move`,
    resize: `url(${resizeCursor}) 16 16, ew-resize`,
    select: `url(${selectCursor}) 6 4, default`
  }
  onMount(() => {
    app.renderer.plugins.interaction.cursorStyles['move'] = myCursorStyle.move
    app.renderer.plugins.interaction.cursorStyles['ew-resize'] = myCursorStyle.resize

    app.stage.sortableChildren = true
    app.renderer.view.addEventListener('click', () => {
      if (currentMode === 'bpm') {
        dispatch('changeBPM', {
          tick: $cursor.tick,
          bpm: bpms.get($cursor.tick) || bpms.get(closest([...bpms.keys()], $cursor.tick, true))
        })
        return
      }

      if (currentMode === 'tap') {
        singles.push({
          lane: $cursor.lane,
          tick: $cursor.tick,
          width: Math.min(2, LANE_MAX - $cursor.lane + 1),
          critical: false,
          flick: 'no'
        })
        singles = singles
        dispatch('playSound', 'stage')
        return
      }
    })

    app.renderer.plugins.interaction.addListener('pointerdown', (event: PIXI.InteractionEvent) => {
      if (event.data.button == 2) return
      if ($moving) return
      app.renderer.view.setPointerCapture(event.data.pointerId)
      switch (currentMode) {
        case 'select': {
          dragging = true

          pointA = new PIXI.Point($pointer.x, $pointer.y + app.stage.pivot.y)
          pointB = new PIXI.Point($pointer.x, $pointer.y + app.stage.pivot.y)

          if (!shiftKey) {
            selectedNotes.set([])
          }
          break
        }
        case 'slide': {
          dragging = true
          draggingSlide = {
            head: {
              tick: $cursor.tick,
              lane: $cursor.lane,
              width: 2,
              easeType: false
            },
            tail: {
              tick: $cursor.tick,
              lane: $cursor.lane,
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
      const { x, y } = event.data.global
      $pointer = { x, y }

      if (!dragging) {
        return
      }
      switch (currentMode) {
        case 'select': {
          pointB = new PIXI.Point(x, y + app.stage.pivot.y)
          break
        }
        case 'slide': {
          draggingSlide.tail.lane = $cursor.lane
          draggingSlide.tail.tick = $cursor.tick
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
      if ($moving) {
        dispatch('moveend')
      }
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


    canvasContainer.appendChild(app.view)
  })

  let menu: HTMLDivElement

  let canvasContainer: HTMLDivElement

  $: if (app) {
    app.renderer.plugins.interaction.cursorStyles.default = $moving ? myCursorStyle.move : myCursorStyle.select
    app.renderer.plugins.interaction.setCursorMode($moving ? 'move' : 'default')
  }

  function onslideclick(slide: SlideType) {
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
        break
      }
      case 'mid': {
        if ($cursor.tick === slide.head.tick || $cursor.tick === slide.tail.tick) break
        
        const found = slide.steps.find(({ tick }) => tick === $cursor.tick)
        if (found) {
          console.log(found)
          found.diamond = !found.diamond
        } else {
          const step: SlideStep = {
            lane: $cursor.lane,
            width: slide.head.width,
            tick: $cursor.tick,
            diamond: true,
            easeType: false,
            ignored: false
          }
          slide.steps.push(step)
          slide.steps.sort(({ tick: a }, { tick: b }) => a - b)
        }
        slides = slides
        console.log(slides)
        dispatch('playSound', 'stage')
        break
      }
    }
  }


  // let currentNote: NoteType

  // function getCurrentNote(): NoteType {
  //   return singles.find(({ lane, tick }) => lane === $cursor.lane && tick === $cursor.tick)
  //     ?? slides.map(({ head, tail, steps }) => [head, tail, ...steps]).flat()
  //       .find(({ lane, tick }) => lane === $cursor.lane && tick === $cursor.tick)
  // }

  // function oncontextmenu() {
    // currentNote = getCurrentNote()
  // }

  let currentNote: NoteType

  function onchangecurve(type: EaseType) {
    dispatch('changecurve', { note: currentNote as IEase, type })
  }

  function onchangediamond(type: DiamondType) {
    dispatch('changediamond', { note: currentNote as SlideStep, type})
  }

  function calcDiamondType(note: NoteType): DiamondType {
    const _note = note as SlideStep
    return _note.ignored
      ? 'ignored'
      : _note.diamond
        ? 'visible'
        : 'invisible'
  }
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
        <Note
          bind:note
          on:click={() => {
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
          }}
          on:movestart
          on:move
          on:moveend
          on:dblclick={(event) => { dispatch('selectsingle', event.detail) }}
        />
      {/if}
    {/each}

    <!-- SLIDE NOTES -->
    {#if visibility.Slides}
      {#each slides as slide (slide)}
        <Slide
          bind:slide
          stepsVisible={visibility.SlideSteps}
          on:click={() => {onslideclick(slide)}}
          on:move
          on:movestart
          on:moveend
          on:rightclick={(event) => { currentNote = event.detail.note; console.log('onrightclick', currentNote) }}
          on:dblclick={(event) => { dispatch('selectsingle', event.detail) }}
        />
      {/each}
    {/if}

    <!-- FLOATING ITEMS -->
    <Floating
      {bpms}
      {currentMode}
    />

    <Selection
      dragging={dragging && currentMode === 'select'}
      rect={selectRect}
    />
  </div>
  <div class="zoom-indicator-container">
    <ZoomIndicator bind:zoom min={ZOOM_MIN} max={ZOOM_MAX} step={0.1} />
  </div>
</div>

<!-- CONTEXT MENU -->
<Menu bind:menu>
  <MenuTrigger
    contextArea={canvasContainer}
    {menu}
    slot="trigger"
    on:hidden={() => { currentNote = null }}
  ></MenuTrigger>
  {#if $selectedNotes.length}
    <MenuItem icon="mdi:delete" text="削除" on:click={() => dispatch('delete')} />
    <MenuDivider/>
    <MenuItem icon="ic:content-cut" text="切り取り (&X)" on:click={() => dispatch('cut')} />
    <MenuItem icon="mdi:content-copy" text="コピー (&C)" on:click={() => dispatch('copy')} />
  {/if}
  <MenuItem icon="mdi:content-save" text="貼り付け (&V)" on:click={() => dispatch('paste')}
    disabled={!$clipboardSingles.length && !$clipboardSingles.length}
  />
  {#if !$selectedNotes.length && currentNote && 'easeType' in currentNote}
    <MenuDivider/>
    <MenuItem icon="custom:straight" text="直線" on:click={() => { onchangecurve(false); currentNote = currentNote }} checked={currentNote.easeType === false}/>
    <MenuItem icon="custom:curve-in" text="加速" on:click={() => { onchangecurve('easeOut'); currentNote = currentNote }} checked={currentNote.easeType === 'easeOut'}/>
    <MenuItem icon="custom:curve-out" text="減速" on:click={() => { onchangecurve('easeIn'); currentNote = currentNote }} checked={currentNote.easeType === 'easeIn'}/>
  {/if}
  {#if !$selectedNotes.length && currentNote && 'ignored' in currentNote}
    <MenuDivider/>
    <MenuItem icon="custom:diamond-visible" text="可視" on:click={() => { onchangediamond('visible'); currentNote = currentNote }} checked={calcDiamondType(currentNote) === 'visible'}/>
    <MenuItem icon="custom:diamond-ignored" text="無視" on:click={() => { onchangediamond('ignored'); currentNote = currentNote }} checked={calcDiamondType(currentNote) === 'ignored'}/>
    <MenuItem icon="custom:diamond-invisible" text="不可視" on:click={() => { onchangediamond('invisible'); currentNote = currentNote }} checked={calcDiamondType(currentNote) === 'invisible'}/>
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

    if (event.ctrlKey && event.key == 'c') {
      dispatch('copy')
    }

    if (event.ctrlKey && event.key == 'x') {
      dispatch('cut')
    }

    if (event.ctrlKey && event.key == 'v') {
      dispatch('paste')
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