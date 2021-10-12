<script lang="ts" context="module">
  export const ssr = false;
	export async function load({ page, fetch, session, context }) {
		// const url = `/RelayPoint.sus`;
		// const url = `/NewScore2.sus`;
    // const url = `KING.sus`;
    // const url = `/TellYourWorld_EX.sus`;
    // const url = `/TellYourWorldDiamond.sus`;
    // const url = `/Shoushitsu_MASTER.sus`;
    const url = `/DoctorFunkBeat_MASTER.sus`;
    // const url = `/DoctorDiamond.sus`
    // const url = `/SlideEase.sus`;
    // const url = `MultipleBPM.sus`;
    // const url = `SlideTest.sus`;
    // const url = '/InvisibleRelayPoint.sus'
    // const url = `ModNote.sus`;
		const res = await fetch(url);

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
  import PropertyBox from '$lib/PropertyBox.svelte'
  
  // Components
  import ZoomIndicator from '$lib/ZoomIndicator.svelte'
  import ControlHandler from '$lib/ControlHandler.svelte'
  import DebugInfo from '$lib/basic/DebugInfo.svelte'
  import BpmDialog from '$lib/dialogs/BPMDialog.svelte'

  // Toast
  import { toast, SvelteToast } from '@zerodevx/svelte-toast'

  // Drawing
  import Note from '$lib/render/Note.svelte'
  import Arrow from '$lib/render/Arrow.svelte'
  import Slide from '$lib/render/Slide.svelte'

  // Types
  import type PIXI from 'pixi.js'
  import type { Mode, SnapTo } from '$lib/editing'
  import type { Flick, MetaData, Single, Slide as SlideType } from '$lib/score/beatmap'
  import type { Score } from '$lib/score/analyze'

  // Constants
  import {
    MARGIN,
    MARGIN_BOTTOM,
    TEXT_MARGIN,
    MEASURE_HEIGHT,
    CANVAS_WIDTH,
    LANE_WIDTH,
    NOTE_HEIGHT,
    NOTE_PIVOT,
    NOTE_WIDTH,
    DIAMOND_HEIGHT,
    DIAMOND_WIDTH,
    DIAMOND_PIVOT,
    TICK_PER_MEASURE,
    TICK_PER_BEAT,
    EFFECT_SOUNDS,
    RESOLUTION,
  } from '$lib/consts'
  import { FLICK_TYPES } from '$lib/score/beatmap';

  // Functions
  import { onMount, setContext, tick } from 'svelte';
  import { getMetaData, getScoreData, convertScoreData } from '$lib/score/susIO'
  import { calcX, calcY, calcLane, calcTick } from '$lib/timing'
  import { snap } from '$lib/editing'
  import { clamp } from '$lib/basic/math'
  import { closest, max, rotateNext } from '$lib/basic/collections';

  // Score Data
  export let susText: string;
  let metadata: MetaData
  let score: Score

  // Load Score Data
  metadata = getMetaData(susText)
  score = getScoreData(susText)
  let singleNotes: Single[]
  let slides: SlideType[]
  let bpms: Map<number, number>
  ({ singleNotes, slides, bpms } = convertScoreData(score))

  console.log(score)
  console.log({ singleNotes, slides, bpms })

  // Sound
  import { AudioEvent, AudioScheduler, playOnce } from '$lib/audio';
  let audioContext: AudioContext
  let effectBuffers: Record<string, AudioBuffer>
  const audioNodes: Array<AudioBufferSourceNode> = []
  let scheduler: AudioScheduler
  let master: GainNode

  // PIXI.js
  import { Pixi, Text, Sprite, Graphics } from 'svelte-pixi'
  import { drawBackground, drawSlidePath, drawBPMs, drawSnappingElements, drawPlayhead } from '$lib/render/renderer';

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
            .concat(singleNotes.map(({ tick }) => tick))
            .flat() as number[]
        ) || 0
      ) / TICK_PER_MEASURE
    ) + 1

  $: maxTick = score ? maxMeasure * TICK_PER_MEASURE : 0

  // Pointer (mouse) position -> lane / tick
  let mouseX: number
  let mouseY: number

  $: pointerLane = clamp(2, snap(calcLane(mouseX), 1), 12)
  $: pointerTick = clamp(
    0,
    snap(
      calcTick(mouseY, measureHeight) + scrollTick,
      TICK_PER_MEASURE / snapTo,
    ),
    maxMeasure * TICK_PER_MEASURE
  )

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

  let dragging: boolean = false
  let draggingSlide: SlideType = null

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
    app.stage.on('mousemove', (event: PIXI.InteractionEvent) => {
      const { x, y } = event.data.global
      mouseX = x
      mouseY = y
    })

    app.renderer.view.addEventListener('click', async () => {
      if (currentMode === 'bpm') {
        lastPointerTick = pointerTick
        if (bpms.has(pointerTick)) {
          bpmDialogValue = bpms.get(pointerTick)
        }
        await tick()
        bpmDialogOpened = true
        return
      }

      if (currentMode === 'tap') {
        singleNotes.push({
          lane: pointerLane,
          tick: pointerTick,
          width: 2,
          critical: false,
          flick: 'no'
        })
        singleNotes = singleNotes
        playOnce(audioContext, master, effectBuffers['stage'])
        return
      }

      const singleHere = singleNotes.find((single) => (
            single.tick === pointerTick &&
            single.lane <= pointerLane && pointerLane <= single.lane + single.width
        )
      )

      if (currentMode === 'flick') {
        if (singleHere) {
          singleHere.flick = rotateNext<Flick>(singleHere.flick, FLICK_TYPES)
          singleNotes = singleNotes
          playOnce(audioContext, master, effectBuffers['stage'])
          return
        }

        const slideEndHere = slides.find((slide) => (
          slide.end.tick === pointerTick &&
          slide.end.lane <= pointerLane && pointerLane <= slide.end.lane + slide.end.width
        ))
        if (slideEndHere) {
          slideEndHere.end.flick = rotateNext<Flick>(slideEndHere.end.flick, FLICK_TYPES)
          slides = slides
          playOnce(audioContext, master, effectBuffers['stage'])
        }
        return
      }

      if (currentMode === 'critical') {
        if (singleHere) {
          singleHere.critical = !singleHere.critical
          singleNotes = singleNotes
          playOnce(audioContext, master, effectBuffers['stage'])
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
          playOnce(audioContext, master, effectBuffers['stage'])
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
        playOnce(audioContext, master, effectBuffers['stage'])
      }
    })

    app.renderer.view.addEventListener('pointermove', async () => {
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

  let debugInfo = new Map<string, string | number>()
  function formatPoint(x: number, y: number) {
    return `(${x?.toFixed(3)}, ${y?.toFixed(3)})`
  }
  
  function dbg(title: string, value: string | number) {
    debugInfo.set(title, value)
    debugInfo = debugInfo
  }

  $: dbg('mouse', formatPoint(mouseX, mouseY))
  $: dbg('scrollTick', scrollTick)
  $: dbg('pointerLane', pointerLane)
  $: dbg('pointerTick', pointerTick)
  
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

    const singleEvents: AudioEvent[] = singleNotes
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
      <Pixi {app}>
          <!-- PLAYHEAD -->
          <Graphics
            draw={(graphics) => {
              drawPlayhead(graphics, PIXI, calcY(currentTick, measureHeight))
            }}
          />

          <!-- BACKGROUND -->
          <Graphics
            x={MARGIN}
            y={0}
            draw={(graphics) => { drawBackground(graphics, measureHeight, calcY(maxTick, measureHeight), maxMeasure, innerHeight) }}
          />

          <!-- BPM -->
          <Graphics
            draw={(graphics) => { drawBPMs(graphics, PIXI, bpms, measureHeight) }}
          />

          <!-- MEASURE (BAR) NUMBER -->
          {#each Array(maxMeasure + 1) as _, i}
            <Text
              text={`#${i + 1}`}
              anchor={new PIXI.Point(1, 0.5)}
              x={MARGIN - TEXT_MARGIN}
              y={innerHeight - (MARGIN_BOTTOM + (i * measureHeight))}
              style={{
                fill: 'white'
              }}
            />
          {/each}

          <!-- SINGLE NOTES -->
          {#each singleNotes as { lane, tick, width, critical, flick }}
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
          {#each singleNotes as { lane, tick, width, critical, flick }}
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
      <div class="zoom-indicator-container">
        <ZoomIndicator bind:zoom min={ZOOM_MIN} max={ZOOM_MAX} step={0.1} />
      </div>
    </div>
    <PropertyBox
      bind:currentMeasure
      on:goto={() => {
        scrollTick = (clamp(1, currentMeasure, maxMeasure + 1) - 1) * TICK_PER_MEASURE
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
        canvas.toBlob((b) => {
          var a = document.createElement('a');
          document.body.append(a);
          a.download = 'score.png';
          a.href = URL.createObjectURL(b);
          a.click();
		      a.remove();
        })
      }}
      statistics={{
        'Taps': singleNotes.filter((x) => x.flick === 'no').length,
        'Flicks': singleNotes.filter((x) => x.flick !== 'no').length,
        'Slides': slides.length,
        'Total': singleNotes.length + slides.length,
      }}
      bind:paused
      bind:metadata
      bind:files
      bind:scrollMode
    />
    <!-- <li>Combos: {singleNotes.length + slides.reduce((acc, ele) => acc + ele.steps.length + 2, 0) }</li> -->
    <DebugInfo bind:debugInfo />
  {/if}
</main>

<BpmDialog
  bind:opened={bpmDialogOpened}
  bind:value={bpmDialogValue}
  exist={
    bpms.has(lastPointerTick)
  }
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
    cursor: url('$assets/select-cursor.png') 13 13, auto
  }
</style>

<slot></slot>