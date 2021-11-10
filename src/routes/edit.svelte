<script lang="ts" context="module">
  export const ssr = false
</script>

<script lang="ts">
  // Parts
  import ToolBox from '$lib/ToolBox.svelte'
  import Canvas from '$lib/Canvas.svelte'
  import PropertyBox from '$lib/PropertyBox.svelte'
  
  // UI Components
  import ControlHandler from '$lib/ControlHandler.svelte'
  import AudioManager from '$lib/audio/AudioManager.svelte'
  import DebugInfo from '$lib/ui/DebugInfo.svelte'
  import BpmDialog from '$lib/dialogs/BPMDialog.svelte'
  import UndoToast from '$lib/ui/UndoToast.svelte'

  // Toast
  import { toast, SvelteToast } from '@zerodevx/svelte-toast'

  // Types
  import type PIXI from 'pixi.js'
  import type { Mode, SnapTo } from '$lib/editing/modes'
  import type { ScrollMode } from '$lib/editing/scrolling'
  import type { Metadata, Single, Slide as SlideType, Note as NoteType,  } from '$lib/score/beatmap'

  // Icons
  import { addIcon } from '@iconify/svelte'
  addIcon('custom:curve-in', {
    body: '<path d="M28.5 2C29.0523 2 29.5 2.44772 29.5 3C29.5 20.1387 14.9617 30 3.5 30C2.94772 30 2.5 29.5523 2.5 29C2.5 28.4477 2.94772 28 3.5 28C14.0383 28 27.5 18.8613 27.5 3C27.5 2.44772 27.9477 2 28.5 2Z" fill="currentColor"/>',
    width: 32,
    height: 32
  })
  addIcon('custom:curve-out', {
    body: '<path d="M5.19905 26.3298C4.94543 27.3909 4.70894 28.3804 4.46382 29.2666C4.31659 29.7989 3.76572 30.111 3.23342 29.9638C2.70112 29.8166 2.38897 29.2657 2.5362 28.7334C2.7527 27.9507 2.96986 27.0387 3.2091 26.0339C4.11982 22.2092 5.35054 17.0406 8.08288 12.5433C9.82904 9.66915 12.2072 7.02045 15.5387 5.09512C18.8714 3.16914 23.1013 2 28.5 2C29.0523 2 29.5 2.44771 29.5 3C29.5 3.55228 29.0523 4 28.5 4C23.3988 4 19.5244 5.1017 16.5394 6.82676C13.5533 8.55247 11.4001 10.935 9.79214 13.5817C7.24318 17.7772 6.11053 22.5162 5.19905 26.3298Z" fill="currentColor"/>',
    width: 32,
    height: 32
  })
  addIcon('custom:straight', {
    body: '<path d="M29.1931 2.27917C29.5912 2.66196 29.6036 3.29501 29.2208 3.69311L4.22083 29.6931C3.83804 30.0912 3.205 30.1036 2.80689 29.7208C2.40879 29.338 2.39637 28.705 2.77917 28.3069L27.7792 2.30689C28.162 1.90879 28.795 1.89637 29.1931 2.27917Z" fill="currentColor"/>',
    width: 32,
    height: 32
  })

  addIcon('custom:diamond-visible', {
    body: '<path d="M16 0L31.1266 15.1266L15.859 21.7671V21.6025L15.859 21.6025V3.17182L2.90595 16.1333L15.859 21.7671V23.1894L5.13615 18.5007L15.859 29.2305V23.1894L31.7662 16.2338L16 32L0.452843 16.4528L0 16L0.78792 15.2121L16 0Z" fill="currentColor"/>',
    width: 32,
    height: 32
  })
  addIcon('custom:diamond-invisible', {
    body: '<path d="M1.77883 14.2406L0 16.0064L1.77883 17.7723L2.66099 16.8966L1.76431 16.0064L2.66099 15.1163L1.77883 14.2406ZM4.45435 13.336L3.57219 12.4603L5.36555 10.6801L6.2477 11.5558L4.45435 13.336ZM8.04106 9.77551L9.83442 7.99524L8.95227 7.11953L7.15891 8.8998L8.04106 9.77551ZM11.6278 6.21498L10.7456 5.33926L12.539 3.559L13.4211 4.43471L11.6278 6.21498ZM18.7619 4.47372L19.6569 3.61089L21.424 5.41716L20.5291 6.27999L18.7619 4.47372ZM22.2963 8.08626L23.1912 7.22343L24.9584 9.0297L24.0634 9.89253L22.2963 8.08626ZM25.8306 11.6988L26.7255 10.836L28.4927 12.6422L27.5977 13.5051L25.8306 11.6988ZM27.5977 18.8459L28.4799 19.7216L26.7127 21.4758L25.8306 20.6001L27.5977 18.8459ZM24.0634 22.3544L24.9456 23.2301L23.1784 24.9844L22.2963 24.1087L24.0634 22.3544ZM20.5291 25.8629L21.4112 26.7386L19.6441 28.4929L18.7619 27.6172L20.5291 25.8629ZM13.4211 27.5782L11.6278 25.7979L10.7456 26.6736L12.539 28.4539L13.4211 27.5782ZM9.83442 24.0176L8.04106 22.2374L7.15891 23.1131L8.95227 24.8934L9.83442 24.0176ZM6.24771 20.4571L5.36555 21.3328L3.57219 19.5526L4.45435 18.6768L6.24771 20.4571ZM15.2145 29.3584L16.1112 30.2486L16.9948 29.3714L17.8769 30.2472L16.1112 32L14.3323 30.2342L15.2145 29.3584ZM29.3649 17.0916L30.2471 17.9673L32 16.2272L30.2598 14.4485L29.3649 15.3113L30.2485 16.2145L29.3649 17.0916ZM16.9948 2.66745L17.8897 1.80462L16.1242 0L14.3323 1.77873L15.2145 2.65444L16.1112 1.76431L16.9948 2.66745Z" fill="currentColor"/>',
    width: 32,
    height: 32
  })
  addIcon('custom:diamond-ignored', {
    body: '<path d="M31.1266 15.1266L16 0L9.12132 6.87868L4.18198 1.93934C3.59619 1.35355 2.64645 1.35355 2.06066 1.93934C1.47487 2.52513 1.47487 3.47487 2.06066 4.06066L6.99999 9L0.78792 15.2121L0 16L0.452843 16.4528L16 32L23 25L27.9393 29.9393C28.5251 30.5251 29.4749 30.5251 30.0607 29.9393C30.6464 29.3536 30.6464 28.4038 30.0607 27.818L25.1213 22.8787L31.7662 16.2338L22.5196 20.277L21.5392 19.2966L31.1266 15.1266ZM15.859 13.6164V3.17182L10.6384 8.39579L15.859 13.6164ZM8.5178 10.5178L15.859 17.859V21.6025L15.859 21.6025V21.7671L2.90595 16.1333L8.5178 10.5178ZM15.859 23.1894V21.7671L18.5825 20.5825L19.5677 21.5677L15.859 23.1894ZM15.859 23.1894V29.2305L5.13615 18.5007L15.859 23.1894Z" fill="currentColor"/>',
    width: 32,
    height: 32
  })

  // Constants
  import {
    CANVAS_WIDTH,
    TICK_PER_MEASURE,
    TICK_PER_BEAT,
    RESOLUTION,
    SNAPTO_DEFAULT,
    ZOOM_DEFAULT,
    ZOOM_MIN,
    LANE_MAX,
  } from '$lib/consts'
  import { FLICK_TYPES, DIAMOND_TYPES, EASE_TYPES } from '$lib/score/beatmap'

  // Functions
  import { onMount, setContext, tick } from 'svelte'
  import { dbg } from '$lib/basic/debug'
  import { dumpSUS, loadSUS } from '$lib/score/susIO'
  import { clamp } from '$lib/basic/math'
  import { closest, max, rotateNext } from '$lib/basic/collections'
  import { download, toBlob } from '$lib/basic/file'
  import { toDiamondType, fromDiamondType } from '$lib/score/beatmap'

  // Score Data
  // export let susText: string
  let susText: string = "#00002: 4\n#BPM01: 120\n#00008: 01"
  let metadata: Metadata
  let singles: Single[]
  let slides: SlideType[]
  let bpms: Map<number, number>;

  $: if (susText) {
    ({ metadata, score: { singles, slides, bpms }} = loadSUS(susText))
  }

  console.log({ singles, slides, bpms })

  // Stores
  import { selectedNotes } from '$lib/editing/selection'
  import { clipboardSlides, clipboardSingles, clipboardOffsets } from '$lib/editing/clipboard'

  // Sound
  let soundQueue: string[] = []
  let volume: number = 0.5
  let sfxVolume: number = 1
  $: dbg('volume', volume)
  $: dbg('sfxVolume', sfxVolume)

  // PIXI.js
  let PIXI: typeof import('pixi.js')
  let app: PIXI.Application

  // Sizing
  let zoom: number = ZOOM_DEFAULT

  $: if (zoom <= ZOOM_MIN) zoom = ZOOM_MIN
  // $: if (zoom >= ZOOM_MAX) zoom = ZOOM_MAX

  let innerHeight: number

  // Resize on window resize
  $: app?.renderer.resize(CANVAS_WIDTH, innerHeight)
  
  // Measure (Bar)
  $: currentMeasure = Math.floor(scrollTick / TICK_PER_MEASURE) + 1
  $: if (isNaN(currentMeasure)) currentMeasure = 1
  $: maxMeasure = Math.ceil(
      (
        max(
          slides
            .map(({ head, tail, steps }) => [head.tick, tail.tick, steps.map(({ tick }) => tick)])
            .concat(singles.map(({ tick }) => tick))
            .flat(2) as number[]
        ) || 0
      ) / TICK_PER_MEASURE
    ) + 1
  $: dbg('maxMeasure', maxMeasure)
  $: maxTick = maxMeasure * TICK_PER_MEASURE

  // Scroll position
  let scrollTick = 0
  $: if (scrollTick < 0) scrollTick = 0
  $: if (scrollTick >= maxTick) scrollTick = maxTick

  let scrollMode: ScrollMode = 'page'

  let lastTick: number = 0
  let gotoTick: (tick: number) => void

  // Textures
  import spritesheet from '$assets/spritesheet.json'
  import spritesheetImage from '$assets/spritesheet.png'
  import { cursor } from '$lib/position'

  let TEXTURES: Record<string, PIXI.Texture> = {}
  setContext('TEXTURES', TEXTURES)

  onMount(async () => {
    // Initialise PIXI.js
    PIXI = await import('pixi.js')
    app = new PIXI.Application({
      width: CANVAS_WIDTH,
      height: innerHeight,
      antialias: true,
      resolution: RESOLUTION,
      backgroundAlpha: 0
    })

    app.stage.interactive = true

    // app.stage.addChild(new PIXI.Sprite.from(createGradientCanvas(CANVAS_WIDTH, innerHeight, ['#503c9f', '#48375b'])))
    const baseTexture = new PIXI.BaseTexture(spritesheetImage, null);
    const spritesheetObj = new PIXI.Spritesheet(baseTexture, spritesheet)

    spritesheetObj.parse((textures: PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>) => {
      Object.entries(textures).forEach(([name, texture]) => {
        TEXTURES[name] = texture
      })
    });

    app.ticker.add(() => {
      if (!paused) {
        currentTick += app.ticker.deltaMS * TICK_PER_BEAT * currentBPM / 1000 / 60
      }
    })
  })

  $: bgmURL = bgmfiles && bgmfiles[0] ? URL.createObjectURL(bgmfiles[0]) : undefined 
  let bgmLoading: boolean = false

  let bgmfiles: FileList
  let paused: boolean = true
  function onplaypause() {
    paused = !paused
  }

  let currentTick: number = 0
  $: dbg('currentTick', currentTick)

  let currentMode: Mode = 'select'
  let snapTo: SnapTo = SNAPTO_DEFAULT

  $: dbg('scrollTick', scrollTick)

  
  $: currentBPM = bpms.get(closest([...bpms.keys()], currentTick, true)) ?? 120
  $: dbg('closestTick', currentBPM)
  $: dbg('currentBPM', currentBPM)

  $: dbg('bpms', [...bpms.entries()].map((e) => `[${e[0]}]=${e[1]}bpm`).join('\n'))

  // BPM
  let bpmDialogOpened: boolean = false
  let bpmDialogValue: number = 120
  let lastPointerTick: number = 0

  function onsave() {
    saved = true
    const sus = dumpSUS(metadata, { singles, slides, bpms })
    download(toBlob(sus), `${new Date().toISOString().replace(':', '-')}.sus`)
  }

  let imageDialogOpened: boolean = false

  let visibility: Record<string, boolean> = {
    'Taps': true,
    'Flicks': true, 
    'Slides': true,
    'SlideSteps': true,
    'Total': true
  }

  function deleteNotes(notes: NoteType[], cut = false) {
    exec(new BatchRemove(singles, slides, notes, !cut ? '削除' : 'カット'))
    playSound('stage')
  }

  function copyNotes(notes: NoteType[]) {
    if (!notes.length) return

    $clipboardSingles = singles
      .filter((single) => notes.includes(single))

    $clipboardSlides = slides
      .filter(({ head, tail, steps }) => (
        notes.includes(head) || notes.includes(tail)
        || steps.some((step) => notes.includes(step))
      ))

    $clipboardSlides.map(({ head, tail, steps }) => [head, tail, ...steps]).flat()
      .concat($clipboardSingles)
      .forEach((note) => {
        $clipboardOffsets.set(note, {
          lane: $cursor.lane - note.lane,
          tick: $cursor.tick - note.tick
        })
      })
  }

  function cutNotes(notes: NoteType[]) {
    copyNotes(notes)
    deleteNotes(notes, true)
  }
  
  function onpaste() {
    const pastedSingles = $clipboardSingles.map((note) => {
      const { width, critical, flick } = note
      return {
        lane: $cursor.lane - $clipboardOffsets.get(note).lane,
        tick: $cursor.tick - $clipboardOffsets.get(note).tick,
        width, critical, flick
      }
    })
    const pastedSlides = $clipboardSlides.map((slide): SlideType => {
      const { head, tail, steps, critical } = slide
      return {
        head: {
          lane: $cursor.lane - $clipboardOffsets.get(head).lane,
          tick: $cursor.tick - $clipboardOffsets.get(head).tick,
          width: head.width, easeType: head.easeType
        },
        tail: {
          lane: $cursor.lane - $clipboardOffsets.get(tail).lane,
          tick: $cursor.tick - $clipboardOffsets.get(tail).tick,
          width: tail.width, flick: tail.flick
        },
        steps: steps.map((note) => (
          {
            lane: $cursor.lane - $clipboardOffsets.get(note).lane,
            tick: $cursor.tick - $clipboardOffsets.get(note).tick,
            width: note.width,
            diamond: note.diamond,
            easeType: note.easeType,
            ignored: note.ignored
          })),
        critical
      }
    })

    if (pastedSingles.length === 0 && pastedSlides.length === 0) return
    exec(new BatchAdd(singles, slides, pastedSingles, pastedSlides))

    $selectedNotes = [
      ...pastedSingles,
      ...pastedSlides.map(({ head, tail, steps }) => [head, tail, ...steps]).flat()
    ]
  }

  // Moving
  import { moving, movingNotes, movingOffsets, movingOrigins } from '$lib/editing/moving'
  import type { MoveEvent } from '$lib/editing/moving'
  function onmovestart(origin: MoveEvent) {
    const { lane, tick, note } = origin.detail
    $moving = true
    $movingNotes = $selectedNotes.length ? $selectedNotes : [note]
    $movingNotes.forEach((movingNote) => {
      $movingOffsets.set(movingNote, {
        lane: lane - movingNote.lane,
        tick: tick - movingNote.tick
      })
      $movingOrigins.set(movingNote, {
        lane: movingNote.lane,
        tick: movingNote.tick
      })
    })
  }

  function onmove() {
    $movingNotes.forEach((note) => {
      note.lane = $cursor.lane - $movingOffsets.get(note).lane
      note.tick = $cursor.tick - $movingOffsets.get(note).tick
    })
    singles = singles
    slides = slides
  }

  function onmoveend() {
    $moving = false
  
    const movingTargets = new Map($movingNotes.map((note) => 
      [note, {
        lane: note.lane,
        tick: note.tick
      }]
    ))
    if ($movingNotes.every((note) =>
      note.lane === $movingOrigins.get(note).lane && note.tick === $movingOrigins.get(note).tick
    )) return
    exec(new BatchUpdate(singles, slides, movingTargets, $movingOrigins, '移動'))
    playSound('stage')
  }

  function playSound(name: string) {
    soundQueue.push(name)
    soundQueue = soundQueue
  }

  let shiftKey: boolean = false
  $: dbg('shiftKey', shiftKey)
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    shiftKey = event.shiftKey
  })
  document.addEventListener('keyup', (event: KeyboardEvent) => {
    shiftKey = event.shiftKey
  })

  import { AddBPM, AddSingles, AddSlides, BatchAdd, BatchMutation, BatchRemove, BatchUpdate, BPMMutation, Mutation, RemoveBPM, SetBPM, SingleMutation, SlideMutation, UpdateSingle, UpdateSlide, UpdateSlideNote } from '$lib/editing/mutations'

  import { mutationHistory, undoneHistory } from '$lib/editing/history';

  function onundo() {
    const mutation = $mutationHistory.pop()
    $mutationHistory = $mutationHistory
    if (!mutation) return
    undo(mutation)
    playSound('stage')
  }

  function onredo() {
    const mutation = $undoneHistory.pop()
    $undoneHistory = $undoneHistory
    if (!mutation) return
    exec(mutation)
    playSound('stage')
  }

  function exec(mutation: Mutation) {
    if (mutation.size === 0) return
    saved = false
    $undoneHistory = $undoneHistory.filter((mut) => mut !== mutation)
    if (mutation instanceof SingleMutation) {
      singles = mutation.exec()
    } else if (mutation instanceof SlideMutation) {
      slides = mutation.exec()
    } else if (mutation instanceof BatchMutation) {
      ({ singles, slides } = mutation.exec())
    } else if (mutation instanceof BPMMutation) {
      bpms = mutation.exec()
    }
    $mutationHistory.push(mutation)
    $mutationHistory = $mutationHistory
    toast.push({
      component: {
        src: UndoToast as any,
        props: {
          text: mutation.toString(),
          button: '元に戻す',
          undo() { undo(mutation) },
          mutation,
          history: undoneHistory,
        },
        sendIdTo: 'toastID',
      },
      theme: {
        '--toastWidth': '20rem'
      },
      duration: 8000
    })
  }

  function undo(mutation: Mutation) {
    $mutationHistory = $mutationHistory.filter((mut) => mut !== mutation)
    if (mutation instanceof SingleMutation) {
      singles = mutation.undo()
    } else if (mutation instanceof SlideMutation) {
      slides = mutation.undo()
    } else if (mutation instanceof BatchMutation) {
      ({ singles, slides } = mutation.undo())
    } else if (mutation instanceof BPMMutation) {
      bpms = mutation.undo()
    }
    $undoneHistory.push(mutation)
    $undoneHistory = $undoneHistory
    toast.push({
      component: {
        src: UndoToast as any,
        props: {
          text: '元に戻しました',
          button: 'やり直し',
          undo() { exec(mutation) },
          mutation,
          history: mutationHistory,
        },
        sendIdTo: 'toastID',
      },
      theme: {
        '--toastWidth': '20rem'
      },
      duration: 8000
    })
  }

  import { calcResized, resizing, resizingNotes, resizingOffsets } from '$lib/editing/resizing'
  resizing.subscribe((value) => {
    if (!$resizingNotes.length) return
    if (!value) {
      const modifications = new Map($resizingNotes.map((note) => {
        const { reference, offset } = $resizingOffsets.get(note)
        const [ lane, width ] = calcResized(reference, $cursor.laneSide - offset)
        return [note, { lane, width }]
      }))

      const originalDatas = new Map($resizingNotes.map((note) => {
        const { reference, mutating } = $resizingOffsets.get(note)
        const [ lane, width ] = calcResized(reference, mutating)
        return [note, { lane, width }]
      }))

      exec(new BatchUpdate(singles, slides, modifications, originalDatas, 'リサイズ'))
      playSound('stage')
    }
  })

  let saved = true
  $: dbg('saved', saved)
  function onnew() {
    window.open(window.location.toString())
  }

  let fileInput: HTMLInputElement
  let scoreFiles: FileList
  $: scoreURL = scoreFiles && scoreFiles[0] ? URL.createObjectURL(scoreFiles[0]) : undefined
  $: if (scoreURL) {
    fetch(scoreURL).then((res) => res.text()).then((text) => { susText = text })
  }
  function onopen() {
    if (!saved) {
      alert('ファイルを開くには、現在のファイルを保存するか、新規ウィンドウを開いてください。')
    } else {
      fileInput.click()
    }
  }

  function onskipstart() {
    gotoTick(0)
  }

  function onskipback() {
    gotoTick(lastTick)
  }

  function flipNotes(notes: NoteType[]) {
    const flipTargets = new Map(notes.map((note) => 
      [note, {
        lane: LANE_MAX + 1 - note.lane,
      }]
    ))
    const flipOrigins = new Map(notes.map((note) =>
      [note, {
        lane: note.lane,
      }]
    ))
    exec(new BatchUpdate(singles, slides, flipTargets, flipOrigins, 'ミラー'))
    playSound('stage')
  }

  function duplicateNotes(notes: NoteType[]) {
    if (!notes) {
      notes = $selectedNotes
    }
    const newSingles = singles
      .filter((single) => notes.includes(single))
      .map((single) => ({...single}))

    const newSlides = slides
      .filter(({ head, tail, steps }) => (
        notes.includes(head) || notes.includes(tail)
        || steps.some((step) => notes.includes(step))
      ))
      .map(({ head, tail, steps, critical }) => ({
          head: { ...head },
          tail: { ...tail },
          steps: steps.map((step) => ({...step})),
          critical
        }
      ))

    exec(new BatchAdd(singles, slides, newSingles, newSlides))
    playSound('stage')
  }
</script>

<svelte:head>
  <title>PaletteWorks Editor</title>
</svelte:head>

<input type="file" bind:files={scoreFiles} style="display: none" bind:this={fileInput} accept=".sus" />

<main class="cursor-select" style={`grid-template-columns: auto ${CANVAS_WIDTH}px auto auto;`}>
  {#if app}
    <ToolBox
      bind:currentMode
      bind:snapTo
      on:save={onsave}
      on:image={() => { imageDialogOpened = true }}
      on:copy={() => { copyNotes($selectedNotes) }}
      on:cut={() => { cutNotes($selectedNotes) }}
      on:paste={onpaste}
      on:undo={onundo}
      on:redo={onredo}
      on:new={onnew}
      on:open={onopen}
    />
    <Canvas
      {PIXI}
      {maxMeasure}
      {scrollMode}
      {scrollTick}
      {snapTo}
      {currentMode}
      {innerHeight}
      {visibility}
      {shiftKey}
      bind:app
      bind:currentTick
      bind:paused
      bind:singles
      bind:slides
      bind:bpms
      bind:zoom
      bind:imageDialogOpened
      on:changeBPM={async (event) => {
        ({ tick: lastPointerTick, bpm: bpmDialogValue} = event.detail)
        await tick()
        bpmDialogOpened = true
      }}
      on:playSound={(event) => {
        soundQueue.push(event.detail)
        soundQueue = soundQueue
      }}
      on:delete={(event) => { deleteNotes(event.detail.notes) }}
      on:copy={(event) => { copyNotes(event.detail.notes) }}
      on:cut={(event) => { cutNotes(event.detail.notes) }}
      on:paste={onpaste}
      on:move={onmove}
      on:movestart={onmovestart}
      on:moveend={onmoveend}
      on:changecurve={({ detail: { note, type } }) => {
        // @ts-ignore
        exec(new UpdateSlideNote(slides, note, {
          easeType: type
        }))
        playSound('stage')
      }}
      on:changediamond={({ detail: { note, type }}) => {
        const [diamond, ignored] = fromDiamondType(type)

        exec(new UpdateSlideNote(slides, note, {
          diamond, ignored
        }))
        playSound('stage')
      }}
      on:selectsingle={(event) => {
        if (currentMode !== 'select') return
        const slide = slides
          .map(({ head, tail, steps }) => [head, tail, ...steps])
          .find((slideNotes) => slideNotes.includes(event.detail.note))
        console.log(slide)
        $selectedNotes = slide ?? [event.detail.note]
      }}
      on:slideclick={(event) => {
        const { slide } = event.detail
        switch (currentMode) {
          case 'flick': {
            exec(new UpdateSlideNote(slides, slide.tail, {
              flick: rotateNext(slide.tail.flick, FLICK_TYPES)
            }))
            playSound('stage')
            break
          }
          case 'critical': {
            exec(new UpdateSlide(slides, slide, {
              critical: !slide.critical
            }))
            playSound('stage')
            break
          }
          case 'mid': {
            if ($cursor.tick === slide.tail.tick) break

            if ($cursor.tick === slide.head.tick) {
              if (shiftKey) {
                exec(new UpdateSlideNote(slides, slide.head, {
                  easeType: rotateNext(slide.head.easeType, EASE_TYPES)
                }))
                playSound('stage')
              }
              break
            }

            if (!slide.steps.some(({ tick }) => tick === $cursor.tick)) {
              const step = {
                lane: $cursor.lane,
                width: slide.head.width,
                tick: $cursor.tick,
                diamond: true,
                easeType: false,
                ignored: false
              }
              exec(new UpdateSlide(slides, slide, {
                steps: [...slide.steps, step].sort(({ tick: a }, { tick: b }) => a - b)
              }))
              playSound('stage')
            }
            break
          }
        }
      }}
      on:stepclick={(event) => {
        const { note, slide } = event.detail
        switch (currentMode) {
          case 'flick': {
            exec(new UpdateSlideNote(slides, slide.tail, {
              flick: rotateNext(slide.tail.flick, FLICK_TYPES)
            }))
            playSound('stage')
            break
          }
          case 'critical': {
            exec(new UpdateSlide(slides, slide, {
              critical: !slide.critical
            }))
            playSound('stage')
            break
          }
          case 'mid': {
            if (!shiftKey) {
              const [diamond, ignored] = fromDiamondType(rotateNext(toDiamondType(note.diamond, note.ignored), DIAMOND_TYPES))
              exec(new UpdateSlideNote(slides, note, {
                diamond, ignored
              }))
              playSound('stage')
            } else {
              exec(new UpdateSlideNote(slides, note, {
                easeType: rotateNext(note.easeType, EASE_TYPES)
              }))
              playSound('stage')
            }
            break
          }
        }
      }}
      on:addsingle={({ detail: { note }}) => {
        exec(new AddSingles(singles, [note]))
        playSound('stage')
      }}
      on:updatesingle={({ detail: { note, modification }}) => {
        exec(new UpdateSingle(singles, note, modification))
        playSound('stage')
      }}
      on:addslide={({ detail: { slide }}) => {
        exec(new AddSlides(slides, [ slide ]))
        playSound('stage')
      }}
      on:flip={({ detail: { notes }}) => flipNotes(notes)}
      on:duplicate={({ detail: { notes }}) => duplicateNotes(notes)}
    />
    <PropertyBox
      bind:currentMeasure
      on:goto={() => {
        scrollTick = (clamp(1, currentMeasure, maxMeasure + 1) - 1) * TICK_PER_MEASURE
      }}
      on:undo={onundo}
      on:redo={onredo}
      on:skipstart={onskipstart}
      on:skipback={onskipback}
      statistics={{
        'Taps': singles.filter((x) => x.flick === 'no').length,
        'Flicks': singles.filter((x) => x.flick !== 'no').length,
        'Slides': slides.length,
        'SlideSteps': slides.map(({steps}) => steps).reduce((acc, ele) => acc += ele.length, 0),
        'Total': singles.length + slides.length,
      }}
      bind:paused
      bind:metadata
      bind:files={bgmfiles}
      bind:scrollMode
      bind:visibility
      bind:volume
      bind:sfxVolume
      {bgmLoading}
    />
    <!-- <li>Combos: {singleNotes.length + slides.reduce((acc, ele) => acc + ele.steps.length + 2, 0) }</li> -->
    {#if import.meta.env.DEV}
      <DebugInfo/>
    {/if}
  {/if}
</main>

<BpmDialog
  bind:opened={bpmDialogOpened}
  bind:value={bpmDialogValue}
  exist={bpms.has(lastPointerTick)}
  on:ok={() => {
    if (bpmDialogValue) {
      const last = bpms.get(lastPointerTick)
      if (isNaN(bpmDialogValue)) {
        toast.push('正しい数字ではありません')
        return
      }

      if (last !== bpmDialogValue) {
        const Mutation = last === undefined ? AddBPM : SetBPM
        exec(new Mutation(bpms, lastPointerTick, bpmDialogValue))
      }
    }
  }}
  on:delete={() => {
    exec(new RemoveBPM(bpms, lastPointerTick))
  }}
/>

<ControlHandler
  bind:zoom
  bind:scrollTick
  on:undo={onundo}
  on:redo={onredo}
  on:save={onsave}
  on:open={onopen}
  on:new={onnew}
  on:switch={({ detail: mode }) => { currentMode = mode }}
  on:delete={() => { deleteNotes($selectedNotes) }}
  on:copy={() => { copyNotes($selectedNotes) }}
  on:cut={() => { cutNotes($selectedNotes) }}
  on:paste={onpaste}
  on:skipback={onskipback}
  on:skipstart={onskipstart}
  on:playpause={onplaypause}
  on:duplicate={() => { duplicateNotes($selectedNotes) }}
  on:flip={() => { flipNotes($selectedNotes) }}
/>

<AudioManager
  bind:paused
  bind:currentTick
  bind:lastTick
  bind:bgmLoading
  {currentBPM}
  {slides}
  {singles}
  {bgmURL}
  {volume}
  {sfxVolume}
  bind:gotoTick
  bind:soundQueue
/>

<svelte:window
  bind:innerHeight
  on:beforeunload={(event) => { if (!saved) {
    event.preventDefault()
    event.returnValue = '未保存のデータがあります'
    return '未保存のデータがあります'
  }}}
/>

<SvelteToast/>

<style>
  /* Global Styles */
  :global(body) {
    background: var(--color-background-main);
    color: var(--color-text-main);
    user-select: none;
    overflow: hidden;
  }

  /* Main */
  main {
    display: grid;
    /* grid-template-columns: auto 1fr 1fr; */
  }  

  :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .cursor-select {
    cursor: url('$assets/select-cursor.png') 6 4, auto
  }
</style>

<slot></slot>