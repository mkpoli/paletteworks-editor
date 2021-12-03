<script lang="ts" context="module">
  export const ssr = false
</script>

<script lang="ts">
  // Parts
  import ToolBox from '$lib/ToolBox.svelte'
  import Canvas from '$lib/Canvas.svelte'
  import PropertyBox from '$lib/PropertyBox.svelte'
  
  // UI Components
  import ControlHandler from '$lib/control/ControlHandler.svelte'
  import AudioManager from '$lib/audio/AudioManager.svelte'
  import DebugInfo from '$lib/ui/DebugInfo.svelte'
  import BpmDialog from '$lib/dialogs/BPMDialog.svelte'

  // Toast
  import toast from '$lib/ui/toast'
  import { SvelteToast } from '@zerodevx/svelte-toast'

  // Types
  import type PIXI from 'pixi.js'
  import type { Mode, SnapTo } from '$lib/editing/modes'
  import type { ScrollMode } from '$lib/editing/scrolling'
  import type { Slide as SlideType, Note as NoteType, EaseType, SlideStep, DiamondType, Metadata, Single, Fever, Slide, IDirectional, ICritical } from '$lib/score/beatmap'

  import { hasEaseType, isSlideStep, toDiamondType, EASE_TYPES, DIAMOND_TYPES } from '$lib/score/beatmap'

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
    DEFAULT_PREFERENCES,
  } from '$lib/consts'

  // Functions
  import { onMount, setContext, tick } from 'svelte'
  import { dbg } from '$lib/basic/debug'
  import { dumpSUS, loadSUS } from '$lib/score/susIO'
  import { clamp } from '$lib/basic/math'
  import { closest, rotateNext } from '$lib/basic/collections'
  import { download, toBlob, dropHandlerMultiple } from '$lib/basic/file'
  import { fromDiamondType } from '$lib/score/beatmap'
  import { flipFlick, rotateFlick } from '$lib/editing/flick'

  // Score Data
  const emptySUSData = loadSUS("#00002: 4\n#BPM01: 120\n#00008: 01")

  let metadata: Metadata
  let singles: Single[]
  let slides: Slide[]
  let bpms: Map<number, number>
  let fever: Fever
  let skills: Set<number>

  // let empty: boolean = true
  // $: empty = singles.length === 0 && slides.length === 0 && (bpms.size === 0 || bpms.size === 1 && bpms.get(0) === 120)

  // Stores
  import { selectedNotes } from '$lib/editing/selection'
  import { clipboardSlides, clipboardSingles, clipboardOffsets } from '$lib/editing/clipboard'

  // Sound
  let soundQueue: string[] = []
  let volume: number = 0.5
  let sfxVolume: number = 1

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

  function calcMaxMeasure(bpms: Map<number, number>, duration: number = 3 * 60) {
    const bpmEntries = [...bpms.entries()]
      .sort(([tickA,], [tickB,]) => tickA - tickB)
    const [lastTick, lastBPM] = bpmEntries.at(-1) ?? [0, 120]
    const durationToLastBPM = bpmEntries
      .reduce((acc, [tick, bpm], ind, arr) => {
        const nextElement = arr[ind + 1]
        if (nextElement) {
          const [nextTick, ] = nextElement
          return acc + (nextTick - tick) / TICK_PER_BEAT / bpm * 60
        }
        return acc
      }, 0)
    const durationFromLastBPM = Math.max(duration - durationToLastBPM, 0)
    const maxTick = lastTick + durationFromLastBPM / 60 * lastBPM * TICK_PER_BEAT
    return Math.ceil(maxTick / TICK_PER_MEASURE)
  }
  $: maxMeasure = calcMaxMeasure(bpms, musicDuration)
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

  import { writable } from 'svelte/store'
  const fontLoaded = writable(false)
  setContext('fontLoaded', fontLoaded)

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

    app.loader.add('font', '/fonts/Font.fnt').load(() => {
      $fontLoaded = true
    })

    app.stage.interactive = true
    const baseTexture = new PIXI.BaseTexture(spritesheetImage, {})
    const spritesheetObj = new PIXI.Spritesheet(baseTexture, spritesheet)

    spritesheetObj.parse((textures?: PIXI.utils.Dict<PIXI.Texture<PIXI.Resource>>) => {
      Object.entries(textures!).forEach(([name, texture]) => {
        TEXTURES[name] = texture
      })
    });

    app.ticker.add(() => {
      if (!paused) {
        currentTick += app.ticker.deltaMS * TICK_PER_BEAT * currentBPM / 1000 / 60
        if (currentTick >= maxTick) {
          currentTick = maxTick
          paused = true
        }
      }
    })
  })

  let music: File | null = null
  let bgmLoading: boolean = false
  let musicDuration: number | undefined = undefined

  let paused: boolean = true
  function onplaypause() {
    paused = !paused
  }

  let currentTick: number = 0
  $: dbg('currentTick', currentTick)

  let currentMode: Mode = 'select'
  let snapTo: SnapTo = SNAPTO_DEFAULT

  $: dbg('scrollTick', scrollTick)

  
  $: currentBPM = bpms.get(closest([...bpms.keys()], currentTick, true) ?? NaN) ?? 120

  // BPM
  let bpmDialogOpened: boolean = false
  let bpmDialogValue: number = 120
  let lastPointerTick: number = 0

  function onexport() {
    const sus = dumpSUS(metadata, { singles, slides, bpms, fever, skills })
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

    $clipboardSlides
      .flatMap(({ head, tail, steps }) => [head, tail, ...steps])
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
        lane: $cursor.lane - $clipboardOffsets.get(note)!.lane,
        tick: $cursor.tick - $clipboardOffsets.get(note)!.tick,
        width, critical, flick
      }
    })
    const pastedSlides = $clipboardSlides.map((slide): SlideType => {
      const { head, tail, steps, critical } = slide
      return {
        head: {
          lane: $cursor.lane - $clipboardOffsets.get(head)!.lane,
          tick: $cursor.tick - $clipboardOffsets.get(head)!.tick,
          width: head.width, easeType: head.easeType
        },
        tail: {
          lane: $cursor.lane - $clipboardOffsets.get(tail)!.lane,
          tick: $cursor.tick - $clipboardOffsets.get(tail)!.tick,
          width: tail.width, flick: tail.flick, critical: tail.critical
        },
        steps: steps.map((note) => (
          {
            lane: $cursor.lane - $clipboardOffsets.get(note)!.lane,
            tick: $cursor.tick - $clipboardOffsets.get(note)!.tick,
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
      ...pastedSlides.flatMap(({ head, tail, steps }) => [head, tail, ...steps])
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
      note.lane = $cursor.lane - $movingOffsets.get(note)!.lane
      note.tick = $cursor.tick - $movingOffsets.get(note)!.tick
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
      note.lane === $movingOrigins.get(note)!.lane && note.tick === $movingOrigins.get(note)!.tick
    )) return
    exec(new BatchUpdate(singles, slides, movingTargets, $movingOrigins, '移動'))
  }

  function playSound(name: string) {
    soundQueue.push(name)
    soundQueue = soundQueue
  }

  let shiftKey: boolean = false
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    shiftKey = event.shiftKey
  })
  document.addEventListener('keyup', (event: KeyboardEvent) => {
    shiftKey = event.shiftKey
  })

  import {
    AddBPM,
    AddSingles,
    AddSlides,
    BatchAdd,
    BatchMutation,
    BatchRemove,
    BatchUpdate,
    BatchUpdateCombinated,
    BPMMutation,
    Mutation,
    RemoveBPM,
    SetBPM,
    SingleMutation,
    SlideMutation,
    UpdateSingle,
    UpdateSlide,
    UpdateSlideNote,
    UpdateSlideNotes,
  } from '$lib/editing/mutations'

  import { mutationHistory, undoneHistory } from '$lib/editing/history';

  function onundo() {
    const mutation = $mutationHistory.pop()
    $mutationHistory = $mutationHistory
    if (!mutation) return
    undo(mutation)
  }

  function onredo() {
    const mutation = $undoneHistory.pop()
    $undoneHistory = $undoneHistory
    if (!mutation) return
    exec(mutation)
  }

  function exec(mutation: Mutation) {
    if (mutation.size === 0) return
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
    toast.undo(mutation, undoneHistory, '元に戻す', () => { undo(mutation) })
    playSound('stage')
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
    toast.undo(mutation, mutationHistory, 'やり直し', () => { exec(mutation) })
    playSound('stage')
  }

  import { calcResized, resizing, resizingLastWidth, resizingNotes, resizingOffsets } from '$lib/editing/resizing'
  resizing.subscribe((value) => {
    if (!$resizingNotes.length) return
    if (!value) {
      const modifications = new Map($resizingNotes.map((note) => {
        const { reference, offset } = $resizingOffsets.get(note)!
        const [ lane, width ] = calcResized(reference, $cursor.laneSide - offset)
        return [note, { lane, width }]
      }))

      const originalDatas = new Map($resizingNotes.map((note) => {
        const { reference, mutating } = $resizingOffsets.get(note)!
        const [ lane, width ] = calcResized(reference, mutating)
        return [note, { lane, width }]
      }))

      $resizingLastWidth = modifications.get($resizingNotes[0])!.width

      exec(new BatchUpdate(singles, slides, modifications, originalDatas, 'リサイズ'))
    }
  })

  function onchangecurve({ detail: { note, type } }: CustomEvent<{ note: NoteType | null, type?: EaseType}>) {
    let notes = ($selectedNotes.length ? $selectedNotes : (note ? [note] : [])).filter(hasEaseType)
    let nextType = type ?? rotateNext((note && hasEaseType(note) ? note.easeType : undefined) ?? notes[0].easeType, EASE_TYPES)
    exec(new UpdateSlideNotes(slides, new Map(notes.map((note) => [note, { easeType: nextType }]))))
  }

  function onchangediamond({ detail: { note, type } }: CustomEvent<{ note: NoteType | null, type?: DiamondType }>) {
    let notes = ($selectedNotes.length ? $selectedNotes : (note ? [note] : [])).filter(isSlideStep)
    let nextType = type ?? rotateNext((note && isSlideStep(note) ? toDiamondType(note) : undefined) ?? toDiamondType(notes[0]), DIAMOND_TYPES)
    exec(new UpdateSlideNotes(slides, new Map(notes.map((note) => [note, fromDiamondType(nextType)]))))
  }

  async function savecurrent(message: string) {
    db.projects.update(currentProject!.id!, {
      updated: new Date(),
      metadata, score: {
        singles,
        slides,
        bpms,
        fever,
        skills,
      },
      music,
      preview: await renderPreview()
    })
    updated = false
    toast.success(message)
  }

  initScore()

  function initScore() {
    ({ metadata, score: { singles, slides, bpms, fever, skills }} = emptySUSData)
    music = null
  }
  
  import { db, preferences } from '$lib/database'

  import type { Project } from '$lib/database'
  import ProjectsDialog from '$lib/dialogs/ProjectsDialog.svelte'
  let projectsDialogOpened = true
  let currentProject: Project | null = null
  $: dbg('currentProject.id', currentProject?.id)

  async function onnewproject() {
    if (currentProject) {
      savecurrent(`${currentProject.name} として保存されました。`)
    }
    initScore()
    await tick()
    const project: Project = {
      name: 'Untitled',
      created: new Date(),
      updated: new Date(),
      metadata,
      score: {
        singles,
        slides,
        bpms,
        fever,
        skills,
      },
      music,
      preview: await renderPreview()
    }
    const id = await db.projects.add(project)
    currentProject = await db.projects.get(id) ?? null
    await tick()
    projectsDialogOpened = false
  }

  function onopenproject({ detail: { project }}: CustomEvent<{ project: Project }>) {
    if (currentProject) {
      savecurrent(`${currentProject.name} として保存されました。`)
    }
    ({ metadata, score: { bpms, singles, slides, fever, skills }, music } = project)
    if (skills === undefined) skills = new Set()
    currentProject = project
  }

  let fileInput: HTMLInputElement
  let scoreFiles: FileList
  $: scoreURL = scoreFiles && scoreFiles[0] ? URL.createObjectURL(scoreFiles[0]) : undefined
  $: if (scoreURL) onfileopened(scoreURL)

  function onopenfile() {
    fileInput.click()
  }

  async function onfileopened(url: string) {
    const res = await fetch(url)
    const text = await res.text()
    try {
      ({ metadata, score: { singles, slides, bpms, fever, skills } } = loadSUS(text))
    } catch (e) {
      toast.error(`SUSファイルを読み込む際にエラーが発生しました`)
      console.error(e)
      initScore()
      return
    }
    await tick()
    const project: Project = {
      name: metadata.title || 'Untitled',
      created: new Date(),
      updated: new Date(),
      metadata,
      score: {
        singles,
        slides,
        bpms,
        fever,
        skills,
      },
      music: null,
      preview: await renderPreview()
    }
    const id = await db.projects.add(project)
    currentProject = await db.projects.get(id) ?? null

    await tick()
    projectsDialogOpened = false
  }

  function onopen() {
    projectsDialogOpened = true
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
        ...('flick' in note ? { flick: flipFlick(note.flick) } : {})
      }]
    ))
    const flipOrigins = new Map(notes.map((note) =>
      [note, {
        lane: note.lane,
        ...('flick' in note ? { flick: note.flick } : {})
      }]
    ))
    exec(new BatchUpdate(singles, slides, flipTargets, flipOrigins, 'ミラー'))
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
  }

  function onupdateflicks({ detail: { notes, flip } }: CustomEvent<{ notes: NoteType[], flip: boolean }>) {
    const flickNotes = notes.filter((note) => 'flick' in note) as (NoteType & IDirectional)[]
    if (flickNotes.length === 0) return
    let oldFlick = flickNotes[0].flick
    exec(new BatchUpdate(
      singles, slides,
      new Map(flickNotes.map((note) => [note, { flick: flip ? flipFlick(oldFlick) : rotateFlick(oldFlick) }])),
      new Map(flickNotes.map((note) => [note, { flick: note.flick }])),
      '更新'
    ))
  }

  function onupdatecriticals({ detail: { notes }}: CustomEvent<{ notes: NoteType[] }>) {
    const criticalNotes = new Array<NoteType & ICritical>()
    const criticalSlideSet = new Set<Slide>()
    notes.forEach((note) => {
      if ('critical' in note) {
        criticalNotes.push(note)
      } else {
        const slide = slides.find((slide) => slide.head === note || slide.steps.includes(note as SlideStep))
        if (slide) criticalSlideSet.add(slide)
      }
    })
    const criticalSlides = [...criticalSlideSet]
    if (criticalNotes.length === 0 && criticalSlides.length === 0) return
    let oldcritical = criticalNotes.at(0)?.critical ?? criticalSlides[0].critical ?? false
    console.log('hello')
    exec(new BatchUpdateCombinated(
      singles, slides,
      new Map(criticalNotes.map((note) => [note, { critical: !oldcritical }])),
      new Map(criticalNotes.map((note) => [note, { critical: note.critical }])),
      new Map(criticalSlides.map((slide) => [slide, { critical: !oldcritical }])),
      new Map(criticalSlides.map((slide) => [slide, { critical: slide.critical }])),  
      '更新'
    ))
  }

  function onselectall() {
    $selectedNotes = [...singles, ...slides.flatMap((slide) => [slide.head, slide.tail, ...slide.steps])]
  }

  let updated: boolean = false
  $: dbg('updated', updated)

  $: {
    metadata
    slides
    singles
    bpms
    fever
    skills
    music
    updated = true
  }

  async function renderPreview(): Promise<Blob> {
    const renderTexture = PIXI.RenderTexture.create({
      width: CANVAS_WIDTH,
      height: innerHeight,
      resolution: 0.25
    })
    app.renderer.render(app.stage, { renderTexture })
    const canvas = app.renderer.plugins.extract.canvas(renderTexture)
    return await new Promise(resolve => canvas.toBlob(resolve))
  }

  let { autosaveInterval } = DEFAULT_PREFERENCES
  $: if ($preferences) {
    ({ autosaveInterval } = $preferences)
  }

  $: dbg('autosaveInterval', autosaveInterval)
  
  let autosaveIntervalTimer: number | undefined = undefined
  $: if (autosaveInterval !== 0) {
    clearAutosave()
    autosaveIntervalTimer = window.setInterval(autosave, autosaveInterval * 1000)
  }
  function autosave() {
    if (currentProject && updated) {
      savecurrent(`自動保存されました。`)
    }
  }
  function clearAutosave() {
    if (autosaveIntervalTimer) {
      window.clearInterval(autosaveIntervalTimer)
    }
  }

  import PreferencesDialog from '$lib/dialogs/PreferencesDialog.svelte'
  let preferencesDialogOpened = false
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
      on:export={onexport}
      on:image={() => { imageDialogOpened = true }}
      on:copy={() => { copyNotes($selectedNotes) }}
      on:cut={() => { cutNotes($selectedNotes) }}
      on:paste={onpaste}
      on:undo={onundo}
      on:redo={onredo}
      on:new={onnewproject}
      on:open={onopen}
      on:selectall={onselectall}
      on:preferences={() => { preferencesDialogOpened = true }}
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
      bind:fever
      bind:skills
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
      on:changecurve={onchangecurve}
      on:changediamond={onchangediamond}
      on:selectsingle={(event) => {
        if (currentMode !== 'select') return
        const slide = slides
          .map(({ head, tail, steps }) => [head, tail, ...steps])
          .find((slideNotes) => slideNotes.includes(event.detail.note))
        console.log(slide)
        $selectedNotes = slide ?? [event.detail.note]
      }}
      on:selectall={onselectall}
      on:addsingle={({ detail: { note }}) => {
        exec(new AddSingles(singles, [note]))
      }}
      on:updatesingle={({ detail: { note, modification }}) => {
        exec(new UpdateSingle(singles, note, modification))
      }}
      on:addslide={({ detail: { slide }}) => {
        exec(new AddSlides(slides, [ slide ]))
      }}
      on:updateslidenote={({ detail: { note, modification }}) => {
        exec(new UpdateSlideNote(slides, note, modification))
      }}
      on:updateslide={({ detail: { slide, modification }}) => {
        exec(new UpdateSlide(slides, slide, modification))
      }}
      on:updateflicks={onupdateflicks}
      on:updatecriticals={onupdatecriticals}
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
      bind:music
      bind:scrollMode
      bind:visibility
      bind:volume
      bind:sfxVolume
      {bgmLoading}
      totalCombo={
        singles.length +
        slides.reduce((sum, { head, tail, steps }) => {
          const TICK_PER_HALF_BEAT = TICK_PER_BEAT / 2
          // head + tail
          sum += 2
          // steps
          sum += steps.filter((step) => step.diamond).length
          // hidden combo
          sum += Math.floor((tail.tick - head.tick) / TICK_PER_HALF_BEAT - 0.5)
          return sum
        }, 0)
      }
    />
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
        toast.error('正しい数字ではありません')
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

<ProjectsDialog
  {currentProject}
  bind:opened={projectsDialogOpened}
  on:open={onopenproject}
  on:openfile={onopenfile}
  on:new={onnewproject}
  on:delete={({ detail }) => {
    db.projects.delete(detail)
    if (currentProject && currentProject.id === detail) {
      currentProject = null
      initScore()
    }
  }}
/>

<PreferencesDialog
  bind:opened={preferencesDialogOpened}
/>

<ControlHandler
  bind:zoom
  bind:scrollTick
  on:undo={onundo}
  on:redo={onredo}
  on:export={onexport}
  on:save={() => { savecurrent(`保存されました`) }}
  on:open={onopen}
  on:new={onnewproject}
  on:switch={({ detail: mode }) => { currentMode = mode }}
  on:delete={() => { deleteNotes($selectedNotes) }}
  on:copy={() => { copyNotes($selectedNotes) }}
  on:cut={() => { cutNotes($selectedNotes) }}
  on:paste={onpaste}
  on:image={() => { imageDialogOpened = true }}
  on:skipback={onskipback}
  on:skipstart={onskipstart}
  on:playpause={onplaypause}
  on:duplicate={() => { duplicateNotes($selectedNotes) }}
  on:flip={() => { flipNotes($selectedNotes) }}
  on:selectall={onselectall}
/>

<AudioManager
  bind:paused
  bind:currentTick
  bind:lastTick
  bind:bgmLoading
  bind:musicDuration
  {currentBPM}
  {slides}
  {singles}
  {music}
  {volume}
  {sfxVolume}
  bind:gotoTick
  bind:soundQueue
/>

<svelte:window
  bind:innerHeight
  on:beforeunload={(event) => { if (updated) {
    event.preventDefault()
    event.returnValue = '本当にエディターを閉じますか'
    return '本当にエディターを閉じますか'
  }}}
  on:dragover|preventDefault
  on:drop|preventDefault={dropHandlerMultiple([
    { accept: '.sus', callback(file) { onfileopened(URL.createObjectURL(file)) } },
    { accept: 'audio/*', callback(file) {
      if (currentProject) {
        music = file
      } else {
        onnewproject()
        tick().then(() => {
          music = file
        })
      }
    }}],
    () => { toast.error('未知のファイルタイプ') }
  )}
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
    height: 100vh;
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