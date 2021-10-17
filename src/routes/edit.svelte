<script lang="ts" context="module">
  export const ssr = false;
	export async function load({ page, fetch, session, context }) {
		// const url = `/RelayPoint.sus`
		// const url = `/NewScore2.sus`
    // const url = `KING.sus`
    // const url = `/TellYourWorld_EX.sus`
    const url = `/TellYourWorld_EX.reimported.sus`
    // const url = `/TellYourWorldDiamond.sus`
    // const url = `/Shoushitsu_MASTER.sus`
    // const url = `/DoctorFunkBeat_MASTER.sus`
    // const url = `/SingleAIR.sus`
    // const url = `/DoctorDiamond.sus`
    // const url = `/SlideEase.sus`
    // const url = `MultipleBPM.sus`
    // const url = `LongSingle.sus`
    // const url = `SlideTest.sus`
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
  import ZoomIndicator from '$lib/ZoomIndicator.svelte'
  import ControlHandler from '$lib/ControlHandler.svelte'
  import DebugInfo from '$lib/ui/DebugInfo.svelte'
  import BpmDialog from '$lib/dialogs/BPMDialog.svelte'
  import Menu from '$lib/ui/Menu.svelte';
  import MenuItem from '$lib/ui/MenuItem.svelte';
  import MenuTrigger from '$lib/ui/MenuTrigger.svelte'

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
    EFFECT_SOUNDS,
    RESOLUTION,
  } from '$lib/consts'

  // Functions
  import { onMount, setContext, tick } from 'svelte'
  import { dbg } from '$lib/basic/debug'
  import { dumpSUS, loadSUS } from '$lib/score/susIO'
  import { snap } from '$lib/editing'
  import { clamp } from '$lib/basic/math'
  import { closest, max } from '$lib/basic/collections'
  import { download } from '$lib/basic/file'

  // Score Data
  export let susText: string
  let metadata: Metadata
  let singles: Single[]
  let slides: SlideType[]
  let bpms: Map<number, number>;
  ({ metadata, score: { singles, slides, bpms }} = loadSUS(susText))

  console.log({ singles, slides, bpms })

  // Sound
  import { AudioEvent, AudioScheduler, playOnce } from '$lib/audio';
  let audioContext: AudioContext
  let effectBuffers: Record<string, AudioBuffer>
  const audioNodes: Array<AudioBufferSourceNode> = []
  let scheduler: AudioScheduler
  let master: GainNode

  // PIXI.js
  let PIXI: typeof import('pixi.js')
  let app: PIXI.Application

  // Zooming
  let zoom = 1
  const ZOOM_MIN = 0.1
  const ZOOM_MAX = 10.0
  $: if (zoom <= ZOOM_MIN) zoom = ZOOM_MIN
  $: if (zoom >= ZOOM_MAX) zoom = ZOOM_MAX

  // Sizing
  let innerHeight: number
  $: fullHeight = MARGIN_BOTTOM + maxMeasure * measureHeight + measureHeight 

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
            .map(({ start, end, steps }) => [start.tick, end.tick, steps.map(({ tick }) => tick)])
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
    // Initialise Audio
    audioContext = new AudioContext()
    master = audioContext.createGain();
    master.gain.value = 0.15
    master.connect(audioContext.destination)
    
    effectBuffers = Object.fromEntries(await Promise.all(Object.entries(EFFECT_SOUNDS).map(async ([name, path]) => {
      const response = await fetch(path)
      const arrayBuffer = await response.arrayBuffer()
      return [name, await audioContext.decodeAudioData(arrayBuffer)]
    })))
    console.log({effectBuffers})
    
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

  let canvasContainer: HTMLDivElement
  // audioFileURL = files && files[0] ? URL.createObjectURL(files[0]) : undefined 
  let files: FileList
  let paused: boolean = true
  let currentTick: number = 0
  $: dbg('currentTick', currentTick)

  let currentMode: Mode = 'select'
  let snapTo: SnapTo = 8

  $: dbg('scrollTick', scrollTick)

  
  $: currentBPM = bpms.get(closest([...bpms.keys()], currentTick, true))
  $: dbg('closestTick', currentBPM)
  $: dbg('currentBPM', currentBPM)

  $: dbg('bpms', [...bpms.entries()].map((e) => `[${e[0]}]=${e[1]}bpm`).join('\n'))

  let bpmDialogOpened: boolean = false
  let bpmDialogValue: number = 120
  let lastPointerTick: number = 0

  function tick2secs(tick: number) {
    return tick / (TICK_PER_BEAT * currentBPM / 60)
  }

  function newSchedular(): AudioScheduler {
    const bgmEvent: AudioEvent = {
      time: 0,
      sound: 'bgm',
      startFrom: tick2secs(currentTick)
    }

    const singleEvents: AudioEvent[] = singles
      .filter(({ tick }) => tick >= currentTick)
      .map(({ tick, critical, flick }) => ({
        time: tick2secs(tick - currentTick),
        sound: flick !== 'no'
                ? (critical ? 'flickCritical' : 'flick')
                : (critical ? 'tapCritical' : 'tapPerfect' ) 
      }))

    const slideEvents = slides
      .reduce((acc, { critical, start, end, steps }) => {
        const connectEvent: AudioEvent = 
          end.tick <= currentTick
            ? {
                time: tick2secs(Math.max(start.tick, currentTick) - currentTick),
                sound: !critical ? 'connect' : 'connectCritical',
                loopTo: tick2secs(end.tick - currentTick)
              }
            : null
        const startEvent: AudioEvent = start.tick >= currentTick
          ? {
              time: tick2secs(start.tick - currentTick),
              sound: !critical ? 'tick' : 'tickCritical'
            }
          : null
        const endEvent: AudioEvent = end.tick >= currentTick
          ? {
            time: tick2secs(end.tick - currentTick),
            sound: end.flick !== 'no'
                ? (critical ? 'flickCritical' : 'flick')
                : (critical ? 'tapCritical' : 'tapPerfect' ) 
          }
          : null
        const stepEvents = steps
          .filter(({ tick }) => tick >= currentTick)
          .reduce((a, { tick, diamond }) => {
            if (diamond) {
              a.push({
                time: tick2secs(tick - currentTick),
                sound: !critical ? 'tick' : 'tickCritical'
              })
            }
            return a
          }, [] as AudioEvent[])
        return [...acc, connectEvent, startEvent, endEvent, ...stepEvents]
      }, [] as AudioEvent[])

    const events: Array<AudioEvent> = [bgmEvent, ...singleEvents, ...slideEvents]
      .filter((event) => event)
      .sort(({ time: a }, { time: b }) => a - b)

    console.log(events)

    return new AudioScheduler(audioContext, audioNodes, {
      events,
      callback(event: AudioEvent, offset: number) {
        const soundSource = audioContext.createBufferSource()
        soundSource.buffer = effectBuffers[event.sound]
        audioNodes.push(soundSource)
        soundSource.connect(master)
        const startTime = event.time + offset
        soundSource.start(startTime, event.startFrom ? tick2secs(currentTick) : null)
        if (event.loopTo) {
          soundSource.loop = true
          soundSource.stop(event.loopTo)
        }
      }
    })
  }

  $: if (!paused) {
    // Pause -> Start
    scheduler = newSchedular()
    scheduler.start()
  } else {
    // Start -> Pause
    scheduler?.stop()
  }

  let menu: HTMLDivElement
</script>

<svelte:head>
  <title>PaletteWorks Editor</title>
</svelte:head>

<main class="cursor-select">
  {#if app}
    <ToolBox
      bind:currentMode
      bind:snapTo
    />
    <div
      class="canvas-container"
      bind:this={canvasContainer}
      style={`width: ${CANVAS_WIDTH}px;`}
    >
      <Canvas
        bind:app
        {PIXI}
        {maxMeasure}
        {maxTick}
        {currentTick}
        {measureHeight}
        {scrollTick}
        {snapTo}
        {currentMode}
        {innerHeight}
        bind:singles
        bind:slides
        bind:bpms
        on:changeBPM={async (event) => {
          ({ tick: lastPointerTick, bpm: bpmDialogValue} = event.detail)
          await tick()
          bpmDialogOpened = true
        }}
        on:playSound={(event) => {
          playOnce(audioContext, master, effectBuffers[event.detail])
        }}
      />
      <div class="zoom-indicator-container">
        <ZoomIndicator bind:zoom min={ZOOM_MIN} max={ZOOM_MAX} step={0.1} />
      </div>
    </div>
    <PropertyBox
      bind:currentMeasure
      on:goto={() => {
        scrollTick = (clamp(1, currentMeasure, maxMeasure + 1) - 1) * TICK_PER_MEASURE
      }}
      on:exportFile={() => {
        const sus = dumpSUS(metadata, { singles, slides, bpms })
        console.log(sus)
        const blob = new Blob([sus], {type: 'text/sus+plain'})
        download(blob, `${new Date().toISOString().replace(':', '-')}.sus`)
      }}
      on:export={() => {
        const COLUMN_HEIGHT = snap(8192, measureHeight * RESOLUTION)
        const columns = Math.ceil(fullHeight * RESOLUTION / COLUMN_HEIGHT) + 2
        const COLUMN_WIDTH = app.renderer.width * 0.9
        const renderTexture = PIXI.RenderTexture.create({
          width: COLUMN_WIDTH * columns, height: COLUMN_HEIGHT,
          resolution: 0.35
        })
        
        console.log({ columns })
        for (let i = 0; i < columns; i++) {
          app.renderer.render(app.stage, {
            renderTexture, clear: false,
            transform: new PIXI.Matrix(
              RESOLUTION, 0, 0, RESOLUTION,
              i * COLUMN_WIDTH,
              snap((i + 1) * (COLUMN_HEIGHT - measureHeight * RESOLUTION) + app.stage.pivot.y * RESOLUTION, measureHeight * RESOLUTION) + measureHeight * RESOLUTION - innerHeight * RESOLUTION) //fullHeight - 2 * innerHeight
          })
        }

        // const canvas = app.renderer.plugins.extract.canvas(app.stage)
        const canvas = app.renderer.plugins.extract.canvas(renderTexture);
        canvas.toBlob((blob) => {
          download(blob, `${new Date().toISOString().replace(':', '-')}.png`)
        })
      }}
      statistics={{
        'Taps': singles.filter((x) => x.flick === 'no').length,
        'Flicks': singles.filter((x) => x.flick !== 'no').length,
        'Slides': slides.length,
        'Total': singles.length + slides.length,
      }}
      bind:paused
      bind:metadata
      bind:files
      bind:scrollMode
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

<svelte:window
  bind:innerHeight
/>

<SvelteToast/>

<Menu bind:menu>
  <MenuTrigger contextArea={canvasContainer} {menu} slot="trigger" ></MenuTrigger>
  <MenuItem icon="mdi:delete" text="削除"/>
</Menu>

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
    grid-template-columns: auto 1fr auto auto;
  }  

  .canvas-container {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: hidden;
    display: grid;
    grid-template-columns: 1fr auto;
    position: relative;
    background: linear-gradient(180deg, rgb(11.24% 0% 29.08%) 0%, rgb(6.27% 0% 14.83%) 100%);
  }

  :global(canvas) {
    display: block;
    width: 100%;
    height: 100%;
  }

  .zoom-indicator-container {
    height: 100%;
    padding: 1em;
    display: flex;    
    flex-direction: column;
    justify-content: end;
  }

  .cursor-select {
    cursor: url('$assets/select-cursor.png') 6 4, auto
  }
</style>

<slot></slot>