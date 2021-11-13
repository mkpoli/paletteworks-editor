<script lang="ts">
  // Types
  import type PIXI from 'pixi.js'
  import type { Mode } from '$lib/editing/modes'
  import type { ScrollMode } from '$lib/editing/scrolling'

  import { Single, Slide as SlideType, Note as NoteType, SlideStep, EaseType, IEase, DiamondType, toDiamondType } from '$lib/score/beatmap'

  import '$lib/basic/dblclick'

  // Constants
  import { createEventDispatcher, onMount, setContext, tick } from 'svelte'
  import { ZOOM_MIN, ZOOM_MAX, LANE_MAX, MARGIN_BOTTOM, TICK_PER_MEASURE, MEASURE_HEIGHT, ZOOM_STEP } from '$lib/consts'
  import { FLICK_TYPES } from '$lib/score/beatmap'

  // Functions
  import { snap } from '$lib/basic/math'
  import { closest, rotateNext } from '$lib/basic/collections'
  import { dbg, formatPoint } from '$lib/basic/debug'
  import { selectedNotes } from '$lib/editing/selection'
  import { inside } from '$lib/position'

  // Score Components
  import Background from '$lib/render/Background.svelte'
  import BPM from '$lib/render/BPM.svelte'
  import Playhead from '$lib/render/Playhead.svelte'
  import Note from '$lib/render/Note.svelte'
  import Slide from '$lib/render/Slide.svelte'
  import Selection from '$lib/render/Selection.svelte'
  import Floating from './render/Floating.svelte'
  import StackedArea from './render/StackedArea.svelte'

  // UI Components
  import Menu from '$lib/ui/Menu.svelte'
  import MenuItem from '$lib/ui/MenuItem.svelte'
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'
  import MenuDivider from './ui/MenuDivider.svelte'
  import ZoomIndicator from '$lib/ZoomIndicator.svelte'
  import ImageDialog from '$lib/dialogs/ImageDialog.svelte'

  // Props
  export let app: PIXI.Application
  export let PIXI: typeof import('pixi.js')
  export let currentTick: number
  export let maxMeasure: number
  export let snapTo: number
  export let scrollTick: number
  export let scrollMode: ScrollMode
  export let currentMode: Mode
  export let innerHeight: number
  export let imageDialogOpened: boolean
  export let visibility: Record<string, boolean>
  export let shiftKey: boolean
  export let paused: boolean
  export let zoom: number

  // Score Data
  export let singles: Single[]
  export let slides: SlideType[]
  export let bpms: Map<number, number>

  setContext('app', app)

  $: measureHeight = MEASURE_HEIGHT * zoom

  import { PositionManager, position, pointer, cursor } from '$lib/position'
  $: $position = new PositionManager(measureHeight, scrollTick, snapTo, innerHeight)
  $: $cursor = {
    lane: $position.calcLane($pointer.x),
    tick: $position.calcTick($pointer.y, scrollTick),
    laneSide: $position.calcLaneSide($pointer.x),
    rawTick: $position.calcRawTick2($pointer.y) + scrollTick
  }
  $: dbg('pointer', formatPoint($pointer.x, $pointer.y))
  $: dbg('cursor', formatPoint($cursor.lane, $cursor.tick))
  
  // -- SCROLLING & ZOOMING --

  // Camera follow scroll position
  $: app.stage.pivot.y = MARGIN_BOTTOM - scrollTick / TICK_PER_MEASURE * measureHeight

  // Auto scroll when playing music
  $: if (!paused) {
    if (scrollMode == 'page') {
      scrollTick = snap(currentTick + MARGIN_BOTTOM / MEASURE_HEIGHT * TICK_PER_MEASURE, innerHeight / measureHeight * TICK_PER_MEASURE * 0.76)
    } else if (scrollMode == 'smooth') {
      scrollTick = currentTick - innerHeight / measureHeight * TICK_PER_MEASURE * 0.5 + MARGIN_BOTTOM / MEASURE_HEIGHT * TICK_PER_MEASURE
    }
  }

  // --

  // -- SELECTING --
  let pointA: PIXI.Point
  let pointB: PIXI.Point
  let selectRect: PIXI.Rectangle
  $: if (pointA && pointB) {
    selectRect = point2rect(pointA, pointB)
    dbg('selectRect', formatPoint(selectRect.x, selectRect.y) + '\n' + formatPoint(selectRect.right, selectRect.bottom))
  }
  function point2rect(pointA: PIXI.Point, pointB: PIXI.Point) {
    const 左 = Math.min(pointA.x, pointB.x)
    const 右 = Math.max(pointA.x, pointB.x)
    const 上 = Math.min(pointA.y, pointB.y)
    const 下 = Math.max(pointA.y, pointB.y)

    return new PIXI.Rectangle(
      左, 上, 右 - 左, 下 - 上
    )
  }
  // --

  const dispatch = createEventDispatcher<{
    changeBPM: { tick: number, bpm: number },
    playSound: string,
    delete: { notes: NoteType[] },
    copy: { notes: NoteType[] },
    cut: { notes: NoteType[] },
    paste: void,
    movestart: void,
    move: void,
    moveend: void,
    resizestart: void,
    resize: void,
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
    },
    selectall: void,
    slideclick: {
      slide: SlideType
    },
    addsingle: {
      note: Single
    },
    updatesingle: {
      note: Single,
      modification: Partial<Single>
    },
    addslide: {
      slide: SlideType
    },
    duplicate: {
      notes: NoteType[]
    },
    flip: {
      notes: NoteType[]
    },
  }>()
  let dragging: boolean = false
  let draggingSlide: SlideType = null
  $: if (currentMode) {
    dragging = false
    draggingSlide = null
  }

  import { moving } from './editing/moving'
  $: dbg('moving', $moving)

  import moveCursor from '$assets/move-cursor.png'
  import resizeCursor from '$assets/resize-cursor.png'
  import selectCursor from '$assets/select-cursor.png'

  import { clipboardSingles, clipboardSlides } from './editing/clipboard'
  import { resizing, resizingLastWidth } from './editing/resizing'

  const myCursorStyle = {
    move: `url(${moveCursor}) 16 16, move`,
    resize: `url(${resizeCursor}) 16 16, ew-resize`,
    select: `url(${selectCursor}) 6 4, default`
  }
  onMount(() => {
    app.renderer.plugins.interaction.cursorStyles['move'] = myCursorStyle.move
    app.renderer.plugins.interaction.cursorStyles['ew-resize'] = myCursorStyle.resize

    app.stage.sortableChildren = true

    app.renderer.view.addEventListener('pointerdown', (event: PointerEvent) => {
      pointerOnNote = false
      if (event.button === 2) return
      if ($moving || $resizing || $playheadDragging) return
      app.renderer.view.setPointerCapture(event.pointerId)
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
              width: Math.min($resizingLastWidth, LANE_MAX - $cursor.lane + 1),
              easeType: false
            },
            tail: {
              tick: $cursor.tick,
              lane: $cursor.lane,
              flick: 'no',
              width: Math.min($resizingLastWidth, LANE_MAX - $cursor.lane + 1)
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
      return [...singles, ...slides.flatMap(({ head, tail, steps }) => [head, tail, ...steps])]
        .filter(({ lane, width, tick }) => $position.intersectRect(lane, width, tick, selectRect))
    }

    app.renderer.view.addEventListener('pointerup', (event: PointerEvent) => {
      if (!$moving && !$resizing) {
        if (currentMode === 'tap') {
          dispatch('addsingle', { 
            note : {
              lane: $cursor.lane,
              tick: $cursor.tick,
              width: Math.min($resizingLastWidth, LANE_MAX - $cursor.lane + 1),
              critical: false,
              flick: 'no'
            }
          })
          return
        }

        if (currentMode === 'bpm') {
          dispatch('changeBPM', {
            tick: $cursor.tick,
            bpm: bpms.get($cursor.tick) || bpms.get(closest([...bpms.keys()], $cursor.tick, true))
          })
          return
        }

        if (!pointerOnNote && currentMode === 'flick') {
          dispatch('addsingle', { 
            note : {
              lane: $cursor.lane,
              tick: $cursor.tick,
              width: Math.min($resizingLastWidth, LANE_MAX - $cursor.lane + 1),
              critical: false,
              flick: 'middle'
            }
          })
          return
        }

        if (!pointerOnNote && currentMode === 'critical') {
          dispatch('addsingle', { 
            note : {
              lane: $cursor.lane,
              tick: $cursor.tick,
              width: Math.min($resizingLastWidth, LANE_MAX - $cursor.lane + 1),
              critical: true,
              flick: 'no'
            }
          })
          return
        }
      }

      if ($moving) {
        dispatch('moveend')
      }
      if ($resizing) {
        $resizing = false
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
          } else if (draggingSlide.head.tick == draggingSlide.tail.tick) {
            draggingSlide.tail.tick += TICK_PER_MEASURE / snapTo
          }
          slides = slides
          dispatch('addslide', { slide: draggingSlide })
          draggingSlide = null
          break
        }
      }
      dragging = false
      
    })

    app.renderer.view.addEventListener('dblclick', async () => {
      if (!pointerOnNote) {
        currentTick = $cursor.rawTick
      }
    })

    app.renderer.view.addEventListener('pointerenter', async () => {
      $inside = true
    })
    app.renderer.view.addEventListener('pointerleave', async () => {
      $inside = false
    })

    canvasContainer.appendChild(app.view)
  })

  let menu: HTMLDivElement

  let canvasContainer: HTMLDivElement

  function setCursor(cursor: string) {
    app.renderer.plugins.interaction.cursorStyles.default =  myCursorStyle[cursor]
    app.renderer.plugins.interaction.setCursorMode(cursor)
  }

  $: if (app) {
    if ($moving) {
      setCursor('move')
    } else if ($resizing) {
      setCursor('resize')
    } else {
      setCursor('select')
    }
  }

  import { dragging as playheadDragging } from '$lib/editing/playhead'

  let currentNote: NoteType

  function onchangecurve(type: EaseType) {
    dispatch('changecurve', { note: currentNote as IEase, type })
  }

  function onchangediamond(type: DiamondType) {
    dispatch('changediamond', { note: currentNote as SlideStep, type})
  }

  function calcDiamondType(note: NoteType): DiamondType {
    const _note = note as SlideStep
    return toDiamondType(_note.diamond, _note.ignored)
  }

  let pointerOnNote: boolean = false
  $: dbg('pointerOnNote', pointerOnNote)
</script>

<div
  class="canvas-container"
>
  <div
    bind:this={canvasContainer}
  >
    <!-- PLAYHEAD -->
    <Playhead
      bind:currentTick
      bind:paused
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
            pointerOnNote = true
            switch (currentMode) {
              case 'flick': {
                dispatch('updatesingle', {
                  note, modification: {
                    flick: rotateNext(note.flick, FLICK_TYPES)
                  }
                })
                break
              }
              case 'critical': {
                dispatch('updatesingle', {
                  note, modification: {
                    critical: !note.critical
                  }
                })
                return
              }
           }
          }}
          on:movestart
          on:move
          on:moveend
          on:rightclick={(event) => { currentNote = event.detail.note }}
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
          on:stepclick
          on:tailclick
          on:click={(event) => { pointerOnNote = true; dispatch('slideclick', event.detail) }}
          on:move
          on:movestart
          on:moveend
          on:rightclick={(event) => { currentNote = event.detail.note }}
          on:dblclick={(event) => { dispatch('selectsingle', event.detail) }}
        />
      {/each}
    {/if}

    <!-- FLOATING ITEMS -->
    <Floating
      {bpms}
      {currentMode}
    />

    <!-- STACKED AREAS -->
    <StackedArea
      {singles}
      {slides}
    />

    <Selection
      dragging={dragging && currentMode === 'select'}
      rect={selectRect}
    />
  </div>
  <div class="zoom-indicator-container">
    <ZoomIndicator bind:zoom min={ZOOM_MIN} max={ZOOM_MAX} step={ZOOM_STEP}/>
  </div>
</div>

<!-- CONTEXT MENU -->
<Menu bind:menu>
  <MenuTrigger
    contextArea={canvasContainer}
    {menu}
    slot="trigger"
    on:hidden={async () => {
      await tick()
      currentNote = null
    }}
  ></MenuTrigger>
  {#if $selectedNotes.length}
    <MenuItem icon="mdi:delete" text="削除（全部）" on:click={() => dispatch('delete', { notes: $selectedNotes })} />
    <MenuDivider/>
    <MenuItem icon="ic:content-cut" text="切り取り (&X)" on:click={() => dispatch('cut', { notes: $selectedNotes })} />
    <MenuItem icon="mdi:content-copy" text="コピー (&C)" on:click={() => dispatch('copy', { notes: $selectedNotes })} />
  {:else if currentNote}
    <MenuItem icon="mdi:delete" text="削除" on:click={() => { dispatch('delete', { notes: [currentNote] })}} />
    <MenuDivider/>
    <MenuItem icon="ic:content-cut" text="切り取り (&X)" on:click={() => dispatch('cut', { notes: [currentNote] })} />
    <MenuItem icon="mdi:content-copy" text="コピー (&C)" on:click={() => dispatch('copy', { notes: [currentNote] })} />
  {/if}
  <MenuItem icon="mdi:content-save" text="貼り付け (&V)" on:click={() => dispatch('paste')}
    disabled={!$clipboardSingles.length && !$clipboardSlides.length}
  />
  <MenuDivider/>
  <MenuItem icon="ic:baseline-select-all" text="すべて選択" on:click={() => dispatch('selectall')}/>
  {#if $selectedNotes.length}
    <MenuDivider/>
    <MenuItem icon="mdi:content-duplicate" text="複製 (&D)" on:click={() => dispatch('duplicate', { notes: $selectedNotes })} />
  {:else if currentNote}
    <MenuDivider/>
    <MenuItem icon="mdi:content-duplicate" text="複製 (&D)" on:click={() => dispatch('duplicate', { notes: [currentNote] })} />
  {/if}
  {#if $selectedNotes.length}
    <MenuItem icon="mdi:flip-horizontal" text="左右ミラー (&H)" on:click={() => dispatch('flip', { notes: $selectedNotes })} />
  {/if}
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
  bind:zoom
  {maxMeasure}
/>

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