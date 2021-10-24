<script lang="ts" context="module">
  export const ssr = false;
	export async function load({ page, fetch, session, context }) {
    // const url = `KING.sus`
    // const url = `/TellYourWorld_EX.sus`
    // const url = `/TellYourWorldDiamond.sus`
    // const url = `/Shoushitsu_MASTER.sus`
    // const url = `/DoctorFunkBeat_MASTER.sus`
    // const url = `/SingleAIR.sus`
    // const url = `/DoctorDiamond.sus`
    // const url = `/SlideEase.sus`
    // const url = `MultipleBPM.sus`
    // const url = `LongSingle.sus`
    // const url = `SlideTest.sus`
    // const url = `TwoSlide.sus`
    const url = `SuperLongSlide.sus`
    // const url = '/InvisibleRelayPoint.sus'
    // const url = `ModNote.sus`
    // const url = `MetaTest.sus`
		const res = await fetch(url)

		if (res.ok) {
			return {
				props: {
					susText: await res.text()
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
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

  // Toast
  import { toast, SvelteToast } from '@zerodevx/svelte-toast'

  // Types
  import type PIXI from 'pixi.js'
  import type { Mode, SnapTo } from '$lib/editing'
  import type { Metadata, Single, Slide as SlideType } from '$lib/score/beatmap'

  // Constants
  import {
    MARGIN_BOTTOM,
    MEASURE_HEIGHT,
    CANVAS_WIDTH,
    TICK_PER_MEASURE,
    TICK_PER_BEAT,
    RESOLUTION,
    SNAPTO_DEFAULT,
    ZOOM_DEFAULT,
    ZOOM_MAX,
    ZOOM_MIN,
  } from '$lib/consts'

  // Functions
  import { onMount, setContext, tick } from 'svelte'
  import { dbg } from '$lib/basic/debug'
  import { dumpSUS, loadSUS } from '$lib/score/susIO'
  import { clamp, snap } from '$lib/basic/math'
  import { closest, max } from '$lib/basic/collections'
  import { download, toBlob } from '$lib/basic/file'

  // Score Data
  export let susText: string
  let metadata: Metadata
  let singles: Single[]
  let slides: SlideType[]
  let bpms: Map<number, number>;
  ({ metadata, score: { singles, slides, bpms }} = loadSUS(susText))

  console.log({ singles, slides, bpms })

  // Stores
  import { selectedNotes } from '$lib/selection'

  // Sound
  let soundQueue: string[] = []

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
  
  // Camera follow scroll position
  $: if (app) {
    app.stage.pivot.y = MARGIN_BOTTOM - scrollTick / TICK_PER_MEASURE * measureHeight
  }
  
  // Measure (Bar)
  $: measureHeight = MEASURE_HEIGHT * zoom
  $: currentMeasure = Math.floor(scrollTick / TICK_PER_MEASURE) + 1
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

  type ScrollMode = 'page' | 'smooth'
  let scrollMode: ScrollMode = 'page'

  $: if (!paused) {
    if (scrollMode == 'page') {
      scrollTick = snap(currentTick + MARGIN_BOTTOM / MEASURE_HEIGHT * TICK_PER_MEASURE, innerHeight / measureHeight * TICK_PER_MEASURE * 0.76)
    } else if (scrollMode == 'smooth') {
      scrollTick = currentTick - innerHeight / measureHeight * TICK_PER_MEASURE * 0.5 + MARGIN_BOTTOM / MEASURE_HEIGHT * TICK_PER_MEASURE
    }
  }

  // Textures
  import spritesheet from '$assets/spritesheet.json'
  import spritesheetImage from '$assets/spritesheet.png'

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

  // audioFileURL = files && files[0] ? URL.createObjectURL(files[0]) : undefined 
  let files: FileList
  let paused: boolean = true
  let currentTick: number = 0
  $: dbg('currentTick', currentTick)

  let currentMode: Mode = 'select'
  let snapTo: SnapTo = SNAPTO_DEFAULT

  $: dbg('scrollTick', scrollTick)

  
  $: currentBPM = bpms.get(closest([...bpms.keys()], currentTick, true))
  $: dbg('closestTick', currentBPM)
  $: dbg('currentBPM', currentBPM)

  $: dbg('bpms', [...bpms.entries()].map((e) => `[${e[0]}]=${e[1]}bpm`).join('\n'))

  // BPM
  let bpmDialogOpened: boolean = false
  let bpmDialogValue: number = 120
  let lastPointerTick: number = 0

  function exportSUS() {
    const sus = dumpSUS(metadata, { singles, slides, bpms })
    download(toBlob(sus), `${new Date().toISOString().replace(':', '-')}.sus`)
  }

  let imageDialogOpened: boolean = false

  let visibility: Record<string, boolean> = {
    'Taps': true,
    'Flicks': true, 
    'Slides': true,
    'SlideSteps': false,
    'Total': true
  }
</script>

<svelte:head>
  <title>PaletteWorks Editor</title>
</svelte:head>

<main class="cursor-select" style={`grid-template-columns: auto ${CANVAS_WIDTH}px auto auto;`}>
  {#if app}
    <ToolBox
      bind:currentMode
      bind:snapTo
      on:save={exportSUS}
      on:image={() => { imageDialogOpened = true }}
    />
    <Canvas
      bind:app
      {PIXI}
      {maxMeasure}
      {currentTick}
      {measureHeight}
      {scrollTick}
      {snapTo}
      {currentMode}
      {innerHeight}
      {visibility}
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
      on:delete={() => {
        $selectedNotes.forEach((note) => {
          singles = singles.filter((item) => item !== note)
          slides = slides.filter(({ head, tail }) => head !== note && tail !== note)
          slides.forEach((slide) => {
            slide.steps = slide.steps.filter((item) => item !== note)
          })
          slides = slides
        })
      }}
    />
    <PropertyBox
      bind:currentMeasure
      on:goto={() => {
        scrollTick = (clamp(1, currentMeasure, maxMeasure + 1) - 1) * TICK_PER_MEASURE
      }}
      statistics={{
        'Taps': singles.filter((x) => x.flick === 'no').length,
        'Flicks': singles.filter((x) => x.flick !== 'no').length,
        'Slides': slides.length,
        'SlideSteps': slides.map(({steps}) => steps).reduce((acc, ele) => acc += ele.length, 0),
        'Total': singles.length + slides.length,
      }}
      bind:paused
      bind:metadata
      bind:files
      bind:scrollMode
      bind:visibility
    />
    <!-- <li>Combos: {singleNotes.length + slides.reduce((acc, ele) => acc + ele.steps.length + 2, 0) }</li> -->
    <DebugInfo/>
  {/if}
</main>

<BpmDialog
  bind:opened={bpmDialogOpened}
  bind:value={bpmDialogValue}
  exist={bpms.has(lastPointerTick)}
  on:ok={() => {
    if (bpmDialogValue) {
      const exist = bpms.has(lastPointerTick)
      bpms.set(lastPointerTick, bpmDialogValue)
      bpms = bpms
      toast.push(!exist ? 'BPMを追加しました' : 'BPMを変更しました')
    }
  }}
  on:delete={() => {
    bpms.delete(lastPointerTick)
    bpms = bpms
    toast.push('BPMを削除しました')
  }}
/>

<ControlHandler
  bind:zoom
  bind:paused
  bind:scrollTick
/>

<AudioManager
  {paused}
  {currentTick}
  {currentBPM}
  {slides}
  {singles}
  bind:soundQueue
/>

<svelte:window
  bind:innerHeight
/>

<SvelteToast/>

<style>
  /* Global Styles */
  :global(body) {
    background: var(--color-background-main);
    color: var(--color-text-main);
    font-family: 'FOT-RodinNTLG Pro';
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