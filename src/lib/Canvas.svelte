<script lang="ts">
  // Types
  import type PIXI from 'pixi.js'
  import type { Mode } from '$lib/editing/modes'
  import type { ScrollMode } from '$lib/editing/scrolling'

  import {
    Single as SingleType,
    Slide as SlideType,
    Note as NoteType,
    SlideNote,
    EaseType,
    DiamondType,
    Fever as FeverType,
    Type,
    NOTE_TYPES,
  } from '$lib/score/beatmap'
    
  import { hasEaseType, isSlideStep } from '$lib/score/beatmap'

  // Stores
  import { visibility } from '$lib/editing/visibility'
  import { preferences } from '$lib/preferences'

  import '$lib/basic/collections'

  // Constants
  import { createEventDispatcher, getContext, onMount, setContext } from 'svelte'
  import { ZOOM_MIN, ZOOM_MAX, LANE_MAX, TICK_PER_MEASURE, MEASURE_HEIGHT, ZOOM_STEP, LANE_MIN, LANE_SIDE_MAX, CANVAS_WIDTH, SCROLLBAR_WIDTH, MAIN_WIDTH } from '$lib/consts'

  // Functions
  import { clamp, snap } from '$lib/basic/math'
  import { dbg, formatPoint } from '$lib/basic/debug'
  import { selectedNotes } from '$lib/editing/selection'
  import { inside } from '$lib/position'

  // Score Components
  import Grid from '$lib/render/Grid.svelte'
  import BPM from '$lib/render/BPM.svelte'
  import Playhead from '$lib/render/Playhead.svelte'
  import Single from '$lib/render/Single.svelte'
  import Slide from '$lib/render/Slide.svelte'
  import Selection from '$lib/render/Selection.svelte'
  import Floating from '$lib/render/Floating.svelte'
  import NoteError from '$lib/render/NoteError.svelte'
  import Fever from '$lib/render/Fever.svelte'
  import Skill from '$lib/render/Skill.svelte'
  import MovingNotes from '$lib/render/MovingNotes.svelte'
  import ResizingNotes from '$lib/render/ResizingNotes.svelte'
  import DraggingSlide from '$lib/render/DraggingSlide.svelte'
  import Minimap from '$lib/render/Minimap.svelte'
  import Scrollbar from '$lib/render/Scrollbar.svelte'
  import { NotePlane } from '$lib/render/note'

  // UI Components
  import CanvasContextMenu from '$lib/menus/CanvasContextMenu.svelte'
  import ZoomIndicator from '$lib/ZoomIndicator.svelte'
  import ImageDialog from '$lib/dialogs/ImageDialog.svelte'

  // Props
  export let app: PIXI.Application
  export let PIXI: typeof import('pixi.js')
  export let resourceLoaded: boolean
  export let mainContainer: PIXI.Container
  export let currentTick: number
  export let maxTick: number
  export let maxMeasure: number
  export let snapTo: number
  export let scrollTick: number
  export let scrollMode: ScrollMode
  export let currentMode: Mode
  export let innerHeight: number
  export let imageDialogOpened: boolean
  export let shiftKey: boolean
  export let paused: boolean
  export let zoom: number

  // Score Data
  export let singles: SingleType[]
  export let slides: SlideType[]
  export let bpms: Map<number, number>
  export let timeSignatures: Map<number, [number, number]>
  export let timeSignatureManager: TimeSignatureManager
  export let fever: FeverType
  export let skills: Set<number>

  // Generate Note Textures
  const noteTextures = writable<Record<Type, PIXI.Texture[]>>()
  
  $: if (resourceLoaded) $noteTextures = generateNoteTextures({ width: $preferences.laneWidth, height: $preferences.noteHeight * 25 })
  
  const TEXTURES = getContext<PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>>('TEXTURES')
  const NOTE_TEXTURE: Record<Type, string> = {
    tap: 'noteN.png',
    critical: 'noteC.png',
    flick: 'noteF.png',
    slide: 'noteL.png',
  }

  function generateNoteTextures(unit: { width: number, height: number}): Record<Type, PIXI.Texture[]> {
    const textures: Record<Type, PIXI.Texture[]> = {
      'tap': [],
      'critical': [],
      'slide': [],
      'flick': [],
    }
    for (const type of NOTE_TYPES) {
      for (let i = 1; i <= 12; i++) {
        textures[type].push(app.renderer.generateTexture(new NotePlane(TEXTURES[NOTE_TEXTURE[type]], unit.width * i, unit.height)))
      }
    }
    return textures
  }

  // Contexts
  setContext('app', app)
  setContext('PIXI', PIXI)
  setContext('mainContainer', mainContainer)
  setContext('container', app.stage)
  setContext('noteTextures', noteTextures)

  import type { TimeSignatureManager } from './timing';

  $: measureHeight = MEASURE_HEIGHT * zoom

  import { PositionManager, position, pointer, cursor, placing } from '$lib/position'
  $: $position = new PositionManager(measureHeight, innerHeight, zoom, $preferences.laneWidth)
  $: $cursor = {
    lane: $position.calcLane($pointer.x),
    tick: timeSignatureManager.snap($position.calcScrolledTick($pointer.y, scrollTick), snapTo),
    laneSide: $position.calcLaneSide($pointer.x),
    rawLane: $position.calcRawLane($pointer.x),
    rawTick: $position.calcRawTick2($pointer.y) + scrollTick,
  }
  $: {
    const distance = Math.min($cursor.rawLane - LANE_MIN, LANE_SIDE_MAX - $cursor.rawLane)
    const width = Math.round(clamp(1, 2 * distance, $resizingLastWidth))
    const lane = Math.round(clamp(LANE_MIN, $cursor.rawLane - width / 2, LANE_MAX))
    $placing = { lane, width }
  }
  $: dbg('pointer', formatPoint($pointer.x, $pointer.y))
  $: dbg('cursor', formatPoint($cursor.lane, $cursor.tick))
  $: dbg('shorterDistance', Math.min($cursor.rawLane - LANE_MIN, LANE_SIDE_MAX - $cursor.rawLane))
  $: dbg('cursor.raw', formatPoint($cursor.rawLane, $cursor.rawTick))
  $: dbg('placing', formatPoint($placing.lane, $placing.width))
  
  // -- SCROLLING & ZOOMING --

  // Camera follow scroll position

  import { calcScrollY, calcScrollTick, scrollY, SCROLL_FUNCTIONS } from '$lib/editing/scrolling'

  $: $scrollY = calcScrollY(scrollTick, zoom)
  $: mainContainer.pivot.y = $scrollY

  // Auto scroll when playing music
  $: if (!paused) {
    const scrollFunction = SCROLL_FUNCTIONS[scrollMode]
    if (scrollFunction) {
      scrollTick = scrollFunction(currentTick)
    }
  } else {
    dispatch('scroll', scrollTick)
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

  type Events = {
    changeBPM: { tick: number, bpm: number },
    changeTimeSignature: { tick: number },
    playSound: string,
    delete: { notes: NoteType[] },
    copy: { notes: NoteType[] },
    cut: { notes: NoteType[] },
    paste: void,
    flippaste: void,
    resizestart: void,
    resize: void,
    changecurve: {
      note: NoteType | null,
      type?: EaseType
    },
    changediamond: {
      note: NoteType | null,
      type?: DiamondType
    },
    select: {
      notes: NoteType[],
      overwrite: boolean
    }
    selectsingle: {
      note: NoteType
    },
    selectall: void,
    addsingle: {
      note: SingleType
    },
    updatesingle: {
      note: SingleType,
      modification: Partial<SingleType>
    },
    addslide: {
      slide: SlideType
    },
    updateslide: {
      slide: SlideType,
      modification: Partial<SlideType>
    },
    updateslidenote: {
      note: SlideNote,
      modification: Partial<SlideNote>
    },
    duplicate: {
      notes: NoteType[]
    },
    flip: {
      notes: NoteType[]
    },
    updateflicks: {
      notes: NoteType[],
      flip: boolean
    },
    updatecriticals: {
      notes: NoteType[]
    },
    scroll: number,
    movenotes: {
      movingTargets: Map<NoteType, {
        lane: number
        tick: number
      }>,
      movingOrigins: Map<NoteType, {
        lane: number
        tick: number
      }>
    }
    resizenotes: {
      resizingTargets: Map<NoteType, {
        lane: number
        width: number
      }>,
      resizingOrigins: Map<NoteType, {
        lane: number
        width: number
      }>
    },
    goto: {
      tick: number
    },
  }
  const dispatch = createEventDispatcher<Events>()

  let dragging: boolean = false
  let draggingSlide: SlideType | null = null
  $: if (currentMode) {
    dragging = false
    draggingSlide = null
  }

  let clickTimer: number | undefined
  let isLongPress = false

  import { CURSOR_STYLES, MOUSE_BUTTON } from '$lib/control/pointer'

  let grabbing = false
  let grabbingLastY = 0

  import { Cull } from '@pixi-essentials/cull'
  let cull: Cull

  onMount(() => {
    app.renderer.events.cursorStyles['move'] = CURSOR_STYLES.move
    app.renderer.events.cursorStyles['ew-resize'] = CURSOR_STYLES.resize
    app.renderer.events.cursorStyles['grab'] = CURSOR_STYLES.grab

    app.stage.sortableChildren = true

    cull = new Cull().add(mainContainer)
    app.renderer.on('prerender', () => {
      cull.cull(app.renderer.screen)
    })

    app.renderer.view.addEventListener('pointerdown', (event: PointerEvent) => {
      app.renderer.view.setPointerCapture(event.pointerId)
      clickTimer = window.setTimeout(() => {
        isLongPress = true
      }, 150)
      clickedOnNote = false

      if ($pointer.x > MAIN_WIDTH) {
        return
      }

      if (event.button === MOUSE_BUTTON.MIDDLE) {
        grabbing = true
        grabbingLastY = $pointer.y
        return
      }
      if (event.button === MOUSE_BUTTON.RIGHT) return
      if ($moving || $resizing || $playheadDragging) return
      switch (currentMode) {
        case 'select': {
          dragging = true

          pointA = new PIXI.Point($pointer.x, $pointer.y + $scrollY)
          pointB = new PIXI.Point($pointer.x, $pointer.y + $scrollY)

          if (!shiftKey) {
            selectedNotes.set([])
          }
          break
        }
        case 'slide': {
          draggingSlide = {
            head: {
              tick: $cursor.tick,
              lane: $placing.lane,
              width: $placing.width,
              easeType: false
            },
            tail: {
              tick: $cursor.tick,
              lane: $placing.lane,
              flick: 'no',
              width: $placing.width,
              critical: false,
            },
            critical: false,
            steps: []
          }
          dispatch('playSound', 'stage')
          break
        }
      }
    })

    app.renderer.view.addEventListener('pointermove', (event: PointerEvent) => {
      const point = new PIXI.Point()
      app.renderer.events.mapPositionToPoint(point, event.clientX, event.clientY)
      const { x, y } = point
      $pointer = { x, y }
    })

    app.renderer.view.addEventListener('pointermove', () => {
      if ($pointer.x > MAIN_WIDTH) {
        return
      }

      if (grabbing) {
        scrollTick = calcScrollTick($scrollY - ($pointer.y - grabbingLastY) * 0.5, zoom)
        grabbingLastY = $pointer.y
        return
      }

      if (dragging && currentMode === 'select') {
        pointB = new PIXI.Point($pointer.x, $pointer.y + $scrollY)
        return
      }

      if (draggingSlide !== null && currentMode === 'slide') {
        draggingSlide.tail.lane = $placing.lane
        draggingSlide.tail.tick = $cursor.tick
        draggingSlide.tail.width = $placing.width
        draggingSlide = draggingSlide
        return
      }
    })

    function calcSelection(): NoteType[] {
      return [
        ...singles
          .filter((note) =>
            $visibility.taps && note.flick === 'no' ||
            $visibility.flicks && note.flick !== 'no'
          ),
        ...($visibility.slides ? slides.flatMap(({ head, tail, steps }) => [head, tail, ...steps]) : [])
      ]
        .filter(({ lane, width, tick }) => $position.intersectRect(lane, width, tick, selectRect))
    }

    app.renderer.view.addEventListener('pointerup', (event: PointerEvent) => {
      app.renderer.view.releasePointerCapture(event.pointerId)

      clearTimeout(clickTimer)
      isLongPress = false

      if ($pointer.x > MAIN_WIDTH) {
        return
      }
     
      if (event.button === MOUSE_BUTTON.MIDDLE) {
        grabbing = false
        return
      }

      if (!$moving && !$resizing) {
        const { lane, width } = $placing
        if (currentMode === 'tap') {
          dispatch('addsingle', { 
            note : {
              lane,
              tick: $cursor.tick,
              width,
              critical: false,
              flick: 'no'
            }
          })
          return
        }

        if (currentMode === 'bpm') {
          dispatch('changeBPM', {
            tick: $cursor.tick,
            bpm: bpms.get([...bpms.keys()].closest($cursor.tick, true) ?? NaN) ?? 120
          })
          return
        }

        if (currentMode === 'timeSignature') {
          dispatch('changeTimeSignature', {
            tick: $cursor.tick,
          })
          return
        }

        if (!clickedOnNote && currentMode === 'flick') {
          dispatch('addsingle', { 
            note : {
              lane,
              tick: $cursor.tick,
              width,
              critical: false,
              flick: 'middle'
            }
          })
          return
        }

        if (!clickedOnNote && currentMode === 'critical') {
          dispatch('addsingle', { 
            note : {
              lane,
              tick: $cursor.tick,
              width,
              critical: true,
              flick: 'no'
            }
          })
          return
        }

        if (!clickedOnNote && currentMode === 'mid' && $selectedNotes.length > 0) {
          if (shiftKey && $selectedNotes.some(hasEaseType)) {
            changecurve()
            return
          }
          
          if (!shiftKey && $selectedNotes.some(isSlideStep)) {
            changediamond()
            return
          }
        }
      }

      if ($moving) {
        $moving = false
      }
      if ($resizing) {
        $resizing = false
      }

      if (dragging && currentMode === 'select') {
        $selectedNotes = $selectedNotes.concat(calcSelection())
        dragging = false
      }

      if (draggingSlide !== null && currentMode === 'slide') {
        if (draggingSlide.tail.tick < draggingSlide.head.tick) {
          // Swap
          const { tick, lane, width } = draggingSlide.head
          draggingSlide.head = {
            tick: draggingSlide.tail.tick,
            lane: draggingSlide.tail.lane,
            width: draggingSlide.tail.width,
            easeType: false
          }
          draggingSlide.tail = {
            tick,
            lane,
            width,
            flick: 'no',
            critical: false
          }
        } else if (draggingSlide.head.tick == draggingSlide.tail.tick) {
          draggingSlide.tail.tick += TICK_PER_MEASURE / snapTo
        }
        draggingSlide = draggingSlide
        dispatch('addslide', { slide: draggingSlide })
        draggingSlide = null
      }
    })

    app.renderer.view.addEventListener('click', async (event: MouseEvent) => {
      if ($pointer.x > MAIN_WIDTH) {
        return
      }

      if (event.button !== 0) return
      if (!clickedOnNote) {
        if ($ctrlKey && $clipboardOffsets.size > 0) {
          if ($altKey) {
            dispatch('flippaste')
          } else {
            dispatch('paste')
          }
        } else {
          dispatch('goto', { tick: snap($cursor.rawTick, TICK_PER_MEASURE / snapTo) })
        }
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

  let canvasContainer: HTMLDivElement

  function setCursor(cursor: keyof typeof CURSOR_STYLES) {
    app.renderer.events.cursorStyles.default =  CURSOR_STYLES[cursor]
    app.renderer.events.setCursor(cursor)
  }

  $: if (app) {
    if ($moving) {
      setCursor('move')
    } else if ($resizing) {
      setCursor('resize')
    } else if (grabbing) {
      setCursor('grab')
    } else {
      setCursor('select')
    }
  }

  import { dragging as playheadDragging } from '$lib/editing/playhead'

  let currentNote: NoteType | null = null

  function changecurve(type?: EaseType) {
    dispatch('changecurve', { note: currentNote, type })
  }

  function changediamond(type?: DiamondType) {
    dispatch('changediamond', { note: currentNote, type })
  }

  let clickedOnNote: boolean = false

  // Moving
  import { moving, movingNotes, movingOrigins, movingTargets } from '$lib/editing/moving'

  $: if (!$moving) {
    onmoveend()
  }

  function onmoveend() {
    if ($movingNotes.every((note) => {
      const target = $movingTargets.get(note)!
      const origin = $movingOrigins.get(note)!
      return target.lane === origin.lane && target.tick === origin.tick
    })) return
    dispatch('movenotes', {
      movingTargets: new Map($movingTargets),
      movingOrigins: new Map($movingOrigins),
    })
    $movingNotes = []
  }

  // Resizing
  import { resizing, resizingNotes, resizingLastWidth, resizingTargets, resizingOrigins, resizingOriginNote } from '$lib/editing/resizing'

  $: if (!$resizing) {
    onresizeend()
  }

  let hoveringNote: NoteType | null = null

  function onresizeend() {
    if ($resizingNotes.every((note) => {
      const target = $resizingTargets.get(note)
      const origin = $resizingOrigins.get(note)
      return target && origin && target.lane === origin.lane && target.width === origin.width
    })) return
    dispatch('resizenotes', {
      resizingTargets: new Map($resizingTargets),
      resizingOrigins: new Map($resizingOrigins),
    })
    $resizingNotes = []
    $resizingLastWidth = $resizingTargets.get($resizingOriginNote)!.width
    $resizingTargets = new Map()
    $resizingOrigins = new Map()
  }

  // Clipboard
  import { clipboardOffsets } from './editing/clipboard'
  import { altKey, ctrlKey } from './control/keyboard'
  import PastingNotes from './render/PastingNotes.svelte'
import { writable } from 'svelte/store';
</script>

<div
  class="canvas-container"
  style={`width: ${CANVAS_WIDTH}px;`}
>
  <div
    bind:this={canvasContainer}
  >
    {#if resourceLoaded}
      <!-- PLAYHEAD -->
      <Playhead
        bind:currentTick
        bind:paused
      />

      <!-- BACKGROUND -->
      <Grid
        {maxMeasure}
        {maxTick}
        {snapTo}
        {timeSignatures}
      />

      <!-- BPM -->
      <BPM
        {bpms}
        {timeSignatures}
      />

      <!-- FEVER -->
      <Fever {fever} />

      <!-- SKILL -->
      <Skill {skills} />
    
      <!-- SINGLE NOTES -->
      {#each singles as note (note)}
        {#if $visibility.flicks && note.flick !== 'no' || $visibility.taps && note.flick === 'no' }
          <Single
            bind:note
            on:click={() => {
              clickedOnNote = true
              switch (currentMode) {
                case 'select': {
                  if ($ctrlKey) {
                    dispatch('select', { notes: [note], overwrite: false })
                  }
                  break
                }
                case 'flick': {
                  dispatch('updateflicks', {
                    notes: $selectedNotes.length ? $selectedNotes : [note],
                    flip: shiftKey
                  })
                  break
                }
                case 'critical': {
                  dispatch('updatecriticals', {
                    notes: $selectedNotes.length ? $selectedNotes : [note],
                  })
                  return
                }
            }
            }}
            on:rightclick={(event) => { currentNote = event.detail.note }}
            on:dblclick={(event) => { dispatch('selectsingle', event.detail) }}
            on:pointerenter={() => { hoveringNote = note }}
            on:pointerleave={() => { hoveringNote = null }}
            moving={isLongPress && $moving && $movingNotes.includes(note)}
            resizing={isLongPress && $resizing && $resizingNotes.includes(note)}
          />
        {/if}
      {/each}

      <!-- SLIDE NOTES -->
      {#if $visibility.slides}
        {#each slides as slide (slide)}
          <Slide
            bind:slide
            stepsVisible={$visibility.slidesteps}
            moving={isLongPress && $moving && ($movingNotes.includes(slide.head) || $movingNotes.includes(slide.tail) || slide.steps.some((step) => $movingNotes.includes(step)))}
            on:headclick={({ detail: { note } }) => {
              currentNote = note
              switch(currentMode) {
                case 'select': {
                  if ($ctrlKey) {
                    dispatch('select', { notes: [note], overwrite: false })
                  }
                  break
                }
                case 'mid': {
                  if (shiftKey) {
                    changecurve()
                  }
                  break
                }
                case 'flick': {
                  dispatch('updateflicks', {
                    notes: $selectedNotes.length ? $selectedNotes : [slide.tail],
                    flip: shiftKey
                  })
                  break
                }
                case 'critical': {
                  if ($selectedNotes.length) {
                    dispatch('updatecriticals', {
                      notes: $selectedNotes,
                    })
                  } else {
                    dispatch('updateslide', {
                      slide, modification: {
                        critical: !slide.critical
                      }
                    })
                  }
                  break
                }
              }
            }}
            on:stepclick={({ detail: { note, slide } }) => {
              switch (currentMode) {
                case 'select': {
                  if ($ctrlKey) {
                    dispatch('select', { notes: [note], overwrite: false })
                  }
                  break
                }
                case 'flick': {
                  dispatch('updateflicks', {
                    notes: $selectedNotes.length ? $selectedNotes : [slide.tail],
                    flip: shiftKey
                  })
                  break
                }
                case 'critical': {
                  if ($selectedNotes.length) {
                    dispatch('updatecriticals', {
                      notes: $selectedNotes,
                    })
                  } else {
                    dispatch('updateslide', {
                      slide, modification: {
                        critical: !slide.critical
                      }
                    })
                  }
                  break
                }
                case 'mid': {
                  currentNote = note
                  if (shiftKey) {
                    changecurve()
                  } else {
                    changediamond()
                  }
                  break
                }
              }
            }}
            on:tailclick={({ detail: { note } }) => {
              switch (currentMode) {
                case 'select': {
                  if ($ctrlKey) {
                    dispatch('select', { notes: [note], overwrite: false })
                  }
                  break
                }
                case 'flick': {
                  dispatch('updateflicks', {
                    notes: $selectedNotes.length ? $selectedNotes : [note],
                    flip: shiftKey
                  })
                  break
                }
                case 'critical': {
                  dispatch('updatecriticals', {
                    notes: $selectedNotes.length ? $selectedNotes : [note],
                  })
                  break
                }
              }
            }}
            on:pathclick={({ detail: { slide }}) => {
              clickedOnNote = true
              switch (currentMode) {
                case 'flick': {
                  dispatch('updateflicks', {
                    notes: $selectedNotes.length ? $selectedNotes : [slide.tail],
                    flip: shiftKey
                  })
                  break
                }
                case 'critical': {
                  if ($selectedNotes.length) {
                    dispatch('updatecriticals', {
                      notes: $selectedNotes,
                    })
                  } else {
                    dispatch('updateslide', {
                      slide, modification: {
                        critical: !slide.critical
                      }
                    })
                  }
                  break
                }
                case 'mid': {
                  if ($cursor.tick === slide.tail.tick || $cursor.tick === slide.head.tick) break
                  if (!slide.steps.some(({ tick }) => tick === $cursor.tick)) {
                    const step = {
                      lane: $placing.lane,
                      width: $placing.width,
                      tick: $cursor.tick,
                      diamond: true,
                      easeType: false,
                      ignored: shiftKey
                    }
                    dispatch('updateslide', {
                      slide, modification: {
                        steps: [...slide.steps, step].sort(({ tick: a }, { tick: b }) => a - b)
                      }
                    })
                  }
                  break
                }
              }
            }}
            on:rightclick={(event) => { currentNote = event.detail.note }}
            on:dblclick={(event) => { dispatch('selectsingle', event.detail) }}
            on:pointerenter={({ detail: { note } }) => { hoveringNote = note}}
            on:pointerleave={() => { hoveringNote = null}}
          />
        {/each}
      {/if}

      <!-- FLOATING ITEMS -->
      <Floating
        {bpms}
        {currentMode}
        {hoveringNote}
      />

      <!-- STACKED AREAS -->
      <NoteError
        {singles}
        {slides}
      />

      <Selection
        dragging={dragging && currentMode === 'select'}
        rect={selectRect}
      />

      <PastingNotes/>
      <MovingNotes {singles} {slides} moving={isLongPress && $moving} />
      <ResizingNotes {singles} {slides} resizing={isLongPress && $resizing} />
      <DraggingSlide {draggingSlide} />
      {#if $preferences.minimapEnabled}
        <Minimap
          on:scroll
          {maxMeasure}
          {singles}
          {slides}
          {timeSignatures}
          {maxTick}
        />
      {/if}
      <Scrollbar
        {currentTick}
        {maxTick}
        on:scroll={({ detail }) => { dispatch('scroll', detail) }}
      />
    {/if}
  </div>
  <div class="zoom-indicator-container" style={`right: ${SCROLLBAR_WIDTH}px;`}>
    <ZoomIndicator bind:zoom min={ZOOM_MIN} max={ZOOM_MAX} step={ZOOM_STEP}/>
  </div>
</div>

<!-- CONTEXT MENU -->
<CanvasContextMenu
  {canvasContainer}
  bind:currentNote
  on:changecurve
  on:changediamond
  on:delete
  on:cut
  on:copy
  on:paste
  on:selectall
  on:duplicate
  on:flip
  on:flippaste
  on:shrink
/>

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
    position: absolute;
    height: 100%;
    padding: 1em;
    display: flex;    
    flex-direction: column;
    justify-content: end;
  }
</style>